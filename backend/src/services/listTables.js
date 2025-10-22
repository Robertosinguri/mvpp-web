const { DynamoDBClient, ListTablesCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AccessKeyId',
    secretAccessKey: 'SecretAccessKey',
  },
  endpoint: 'https://asustor-server.tail96fddd.ts.net/',
  tls: true,
});

const docClient = DynamoDBDocumentClient.from(client);

async function verTablas() {
  try {
    // 🔹 Listar todas las tablas
    const tablas = await client.send(new ListTablesCommand({}));
    console.log('📋 Tablas disponibles:', tablas.TableNames);

    // 🔹 Mostrar contenido de cada tabla
    for (const nombre of tablas.TableNames) {
      console.log(`\n=== Contenido de ${nombre} ===`);
      const scan = await docClient.send(new ScanCommand({ TableName: nombre }));
      console.log(scan.Items);
    }
  } catch (err) {
    console.error('❌ Error al listar tablas:', err);
  }
}

verTablas();
