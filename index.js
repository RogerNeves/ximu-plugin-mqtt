const mqtt = require('mqtt')
const axios = require("axios")

let connections = []
let responses = []

var getConnections = async () => {
  await axios.get("http://localhost:3001/mqtt")
    .then(function (res) {
      if (connections) 
        connections.forEach(connection => connection.end() )
      
      connections = []
      responses = res.data
      responses.forEach(async (response, index) => {
        let connection = mqtt.connect(`mqtt://${response.url}:${response.port}`,
          {
            clientId: 'XimuIot',
            username: response.username,
            password: response.password,
            clean: true
            
          })
        connection.topic = response.topic

        connection.on( 'connect', () =>{
          connection.subscribe(response.topic)
        } )
        connection.on('message', sendMeansurements)
        connections.push(connection)
      })      
    }).catch(function (error) {
      console.log(error)
    });
}


const sendMeansurements = function (topic, message, packet) {
  const object = JSON.parse(message);
  const {authorization} = object
  axios.post('http://localhost:3001/meansurements',object ,{
    headers: {
      authorization
    }
  })
    
}
setInterval(getConnections, 10000)






