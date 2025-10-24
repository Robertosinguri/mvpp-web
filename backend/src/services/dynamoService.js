// =======================
// Configuración DynamoDB
// =======================
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Cliente DynamoDB
const client = new DynamoDBClient({  
  region: 'us-east-1', // Se mantiene, pero la región no es crítica para Local
  
  // 1. Añadir credenciales (son requeridas por el SDK, aunque DynamoDB Local no las use)
  credentials: {
    accessKeyId: 'AccessKeyId', // al ser una api privada, adoptamos una clave random 
    secretAccessKey: 'SecretAccessKey' // al ser privada adoptamos una clave random
  },
    
  // 2. Usar el endpoint público de Tailscale Funnel con HTTPS
  endpoint: 'https://asustor-server.tail96fddd.ts.net/', 
  
  // 3. Habilitar SSL/HTTPS (CRÍTICO para Funnel)
  tls: true, // Alias para sslEnabled en SDK v3
});

const docClient = DynamoDBDocumentClient.from(client);

// =======================
// Operaciones CRUD
// =======================

// Crear registro
const crear = async (tabla, item) => {
  const command = new PutCommand({
    TableName: tabla,
    Item: item
  });
  return await docClient.send(command);
};

// Obtener por ID
const obtenerPorId = async (tabla, key) => {
  const command = new GetCommand({
    TableName: tabla,
    Key: key
  });
  const result = await docClient.send(command);
  return result.Item;
};

// Consultar con filtros
const consultar = async (commandParams) => {
  const command = new QueryCommand(commandParams);
  const result = await docClient.send(command);
  return result.Items;
};

// Actualizar registro
const actualizar = async (tabla, key, updateExpression, expressionValues) => {
  const command = new UpdateCommand({
    TableName: tabla,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
    ReturnValues: 'ALL_NEW'
  });
  const result = await docClient.send(command);
  return result.Attributes;
};

// Borrar registro
const borrar = async (tabla, key) => {
  const command = new DeleteCommand({
    TableName: tabla,
    Key: key
  });
  return await docClient.send(command);
};

module.exports = {
  crear,
  obtenerPorId,
  consultar,
  actualizar,
  borrar
};
