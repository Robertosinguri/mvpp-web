const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1'
});

const createTable = async () => {
  const params = {
    TableName: 'mvpp-estadisticas',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'partidaId', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'partidaId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  };

  try {
    // Verificar si la tabla existe
    await client.send(new DescribeTableCommand({ TableName: 'mvpp-estadisticas' }));
    console.log('✅ Tabla mvpp-estadisticas ya existe');
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      // Crear la tabla
      await client.send(new CreateTableCommand(params));
      console.log('✅ Tabla mvpp-estadisticas creada exitosamente');
    } else {
      console.error('❌ Error:', error);
    }
  }
};

createTable();