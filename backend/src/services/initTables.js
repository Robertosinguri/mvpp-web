// =======================
// Inicializador de Tablas DynamoDB Local
// =======================
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Configuración del cliente (misma que tu servicio principal)
const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AccessKeyId',
    secretAccessKey: 'SecretAccessKey'
  },
  endpoint: 'https://asustor-server.tail96fddd.ts.net/',
  tls: true
});

// =======================
// Definición de Tablas
// =======================
const tablas = [
  {
    TableName: 'mvpp-salas',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  {
    TableName: 'mvpp-estadisticas',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'partidaId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'partidaId', KeyType: 'RANGE' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  {
    TableName: 'mvpp-usuarios',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },

  {
    TableName: 'mvpp-resultados-partida',
    AttributeDefinitions: [
      { AttributeName: 'roomCode', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'roomCode', KeyType: 'HASH' },
      { AttributeName: 'userId', KeyType: 'RANGE' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
  
];

// =======================
// Crear Tablas
// =======================
(async () => {
  for (const def of tablas) {
    try {
      console.log(`🚀 Creando tabla: ${def.TableName}...`);
      const command = new CreateTableCommand(def);
      const result = await client.send(command);
      console.log(`✅ ${def.TableName} creada con estado:`, result.TableDescription.TableStatus);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️ La tabla ${def.TableName} ya existe.`);
      } else {
        console.error(`❌ Error creando ${def.TableName}:`, error.message);
      }
    }
  }
})();
