const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'chelseaproteindata';

const saveProteinToS3 = async (proteinId, proteinData) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `proteins/${proteinId}.json`,
    Body: JSON.stringify({
      metadata: {
        version: '1.0',
        createdAt: proteinData.createdAt || new Date().toISOString(),
        updatedAt: proteinData.updatedAt || new Date().toISOString(),
      },
      data: proteinData 
    }),
    ContentType: 'application/json'
  };
  await s3Client.send(new PutObjectCommand(params));
  console.log(`Protein ${proteinId} saved to S3`);
};

const getProteinFromS3 = async (proteinId) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `proteins/${proteinId}.json`
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const data = await streamToString(response.Body);
    const protein = JSON.parse(data);

    if (!protein.data || !protein.data.sequence) {
      throw new Error('Protein not found or sequence missing');
    }

    return protein.data; 
  } catch (error) {
    if (error.Code === 'NoSuchKey') {
      return null;
    }
    throw error;
  }
};

const deleteProteinFromS3 = async (proteinId) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `proteins/${proteinId}.json`
  };
  await s3Client.send(new DeleteObjectCommand(params));
  console.log(`Protein ${proteinId} deleted from S3`);
};

const listProteinsFromS3 = async () => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: 'proteins/'
  };

  const command = new ListObjectsCommand(params);
  const response = await s3Client.send(command);

  const proteinList = [];

  for (const item of response.Contents) {
    const getParams = {
      Bucket: BUCKET_NAME,
      Key: item.Key
    };

    const getCommand = new GetObjectCommand(getParams);
    const proteinData = await s3Client.send(getCommand);

    const proteinBody = await streamToString(proteinData.Body);
    const protein = JSON.parse(proteinBody);

    if (!protein.metadata || !protein.data) {
      console.error('Invalid protein structure');
      continue; 
    }

    proteinList.push(protein.data); 
  }

  return proteinList; 
};

const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};

const updateProteinsList = async (proteinId, proteinName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'proteins/proteins.json'
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const body = await streamToString(response.Body);
    const proteinsList = JSON.parse(body);

    proteinsList.proteins.push({
      id: proteinId,
      name: proteinName
    });

    const updatedParams = {
      ...params,
      Body: JSON.stringify(proteinsList),
      ContentType: 'application/json'
    };
    await s3Client.send(new PutObjectCommand(updatedParams));
    console.log('Proteins list updated');
  } catch (error) {
    if (error.Code === 'NoSuchKey') {
      const newList = {
        proteins: [
          { id: proteinId, name: proteinName }
        ]
      };
      const newParams = {
        ...params,
        Body: JSON.stringify(newList),
        ContentType: 'application/json'
      };
      await s3Client.send(new PutObjectCommand(newParams));
      console.log('New proteins list created');
    } else {
      console.error('Error updating proteins list:', error);
      throw error;
    }
  }
};

const removeProteinFromList = async (proteinId) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: 'proteins/proteins.json'
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    const body = await streamToString(response.Body);
    const proteinsList = JSON.parse(body);

    const updatedList = proteinsList.proteins.filter(protein => protein.id !== proteinId);

    const updatedParams = {
      ...params,
      Body: JSON.stringify({ proteins: updatedList }),
      ContentType: 'application/json'
    };
    await s3Client.send(new PutObjectCommand(updatedParams));
    console.log('Protein removed from list');
  } catch (error) {
    console.error('Error removing protein from list:', error);
    throw error;
  }
};

module.exports = {
  saveProteinToS3,
  getProteinFromS3,
  deleteProteinFromS3,
  listProteinsFromS3,
  updateProteinsList,
  removeProteinFromList
};
