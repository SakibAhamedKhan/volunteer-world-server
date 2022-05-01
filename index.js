const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfmga.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
	try{
		await client.connect();
		const eventsCollection = client.db("volunteerEvent").collection("events");
		const userEventsCollection = client.db("volunteerEvent").collection("userEvents");
		const userAccountCollection = client.db('volunteerEvent').collection('userAccount');

		//  ADD All users
		app.post('/userAccount', async(req, res) =>{
			const doc = req.body;
			console.log(doc);

			const query = {email:doc.email};
			const findedOne = await userAccountCollection.findOne(query);

			const a = doc?.email;
			const b = findedOne?.email;

			if(b === undefined){
				const result = await userAccountCollection.insertOne(doc);
				res.send(result);
			} else{
				res.send({message:'duplicate account'});
			}
			
		})

		// All Events
		app.get('/events', async(req, res) => {
			const query = {};
			const cursor = eventsCollection.find(query);
			const events = await cursor.toArray();
			res.send(events);
		})

		// Find Event by Specific Id
		app.get('/events/:eventId', async(req, res) => {
			// console.log(req.params);
			const eventId = req.params.eventId;
			const query = {_id: ObjectId(eventId)};
			const events = await eventsCollection.findOne(query);
			res.send(events);
		})
		
		// Get the Specifice user Event added
		app.get('/userEvents/:userEmail', async(req, res) =>{
			const email = req.params.userEmail;
			const query = {email: email};
			const cursor =  userEventsCollection.find(query);
			const addedEvents = await cursor.toArray();
			res.send(addedEvents);
		})

		// Add event in user event
		app.post('/userEvents',async(req, res) => {
			const event = req.body;

			const query = {eventId: event.eventId, email: event.email};
			const findedEvent = await userEventsCollection.findOne(query);

			// console.log(findedEvent?.email,event?.email);
			if(findedEvent?.email === event?.email){
				if(findedEvent.eventId === event.eventId){
					res.send({message:'You Already Joined this Event!'})
				} else{
					const result = await userEventsCollection.insertOne(event);
					res.send(result);
				}
			} else{
				console.log('heeee');
				const result = await userEventsCollection.insertOne(event);
				res.send(result);
			}
		})

		// Check  Event in already joined or not
		app.get('/userEventCheck/:eventId/:email', async(req, res) => {
			const eventId = req.params.eventId;
			const email = req.params.email;
			const query = {eventId:eventId, email:email};
			const findEvent = await userEventsCollection.findOne(query);
			// console.log('Finded', findEvent);
			if(findEvent?.email){
				res.send({already: true});
			} else{
				res.send({already: false});
			}
			// console.log(findEvent);
		})

		// User Event Cancel by eventId
		app.delete('/userEventCancel/:eventId/:email', async(req, res) => {
			const eventId = req.params.eventId;
			const email = req.params.email;
			// console.log(eventId, email);
			const query = {eventId:eventId, email:email};
			const result = await userEventsCollection.deleteOne(query);
			res.send(result);
		})


		// -------------####ADMIN#####-------------- //
		// Check admin password and email
		// app.get('/adminEmailPassCheck/:email/:pass', async(req, res) => {
		// 	const email = req.params.email;
		// 	const password = req.params.pass;
		// 	if((email).toLocaleLowerCase() === 'sakibahamedkhan@gmail.com'){
		// 		if(password === '123456'){
		// 			res.send({message:'Successfull', login:true})
		// 		} else{
		// 			res.send({message:'Wrong Password', login:false});
		// 		}
		// 	} else{
		// 		res.send({message:'Wrong Email', login:false});
		// 	}
		// })
		
		// Get All User Registered
		app.get('/userRegistered', async(req, res) =>{
			const query = {};
			const cursor = userAccountCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		// Delete Event from Admin
		app.delete('/eventDelete/:eventId', async(req, res) => {
			const eventId = req.params.eventId;
			// console.log(eventId);
			const query = {_id: ObjectId(eventId)};
			const query2 = {eventId:eventId};
			const result = await eventsCollection.deleteOne(query);
			const result2 = await userEventsCollection.deleteMany(query2);
			res.send(result);
		})
		// Add Event From Admin
		app.post('/eventAdd', async(req, res) => {
			const doc = req.body;
			console.log(doc);
			const result = await eventsCollection.insertOne(doc);
			res.send(result);
		})

	}
	finally{

	}
}
run().catch(console.dir);


app.get('/', (req, res) => {
	res.send("Volunteer Server Running well");
})

app.listen(port, () => {
	console.log('Server Running');
})

