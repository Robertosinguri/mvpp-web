// =======================
// Auto-inicializador de Tablas DynamoDB
// Se ejecuta automáticamente al iniciar el servidor
// =======================
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

// Configuración del cliente (misma que dynamoService.js)
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
// Definición de Tablas Requeridas
// =======================
const tablasRequeridas = [
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
// Verificar y Crear Tablas Automáticamente
// =======================
async function verificarYCrearTablas() {
  try {
    console.log('🔍 Verificando tablas DynamoDB...');
    
    // Obtener lista de tablas existentes
    const listCommand = new ListTablesCommand({});
    const { TableNames: tablasExistentes } = await client.send(listCommand);
    
    // Verificar cada tabla requerida
    for (const tablaDef of tablasRequeridas) {
      const nombreTabla = tablaDef.TableName;
      
      if (tablasExistentes.includes(nombreTabla)) {
        console.log(`✅ ${nombreTabla} - Ya existe`);
      } else {
        console.log(`🚀 ${nombreTabla} - Creando...`);
        try {
          const createCommand = new CreateTableCommand(tablaDef);
          await client.send(createCommand);
          console.log(`✅ ${nombreTabla} - Creada exitosamente`);
        } catch (error) {
          console.error(`❌ Error creando ${nombreTabla}:`, error.message);
        }
      }
    }
    
    console.log('🎯 Verificación de tablas completada\n');
    
  } catch (error) {
    console.error('❌ Error verificando tablas DynamoDB:', error.message);
    console.log('⚠️ El servidor continuará, pero algunas funciones pueden fallar\n');
  }
}

module.exports = { verificarYCrearTablas };