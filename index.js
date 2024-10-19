const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/event/:eventId/gallery/:galleryId', async (req, res) => {
  try {
    await client.connect();
    const database = client.db('test');
    const collection = database.collection('EventInfo');

    const event = await collection.findOne({ _id: new ObjectId(req.params.eventId) });

    if (event) {
      const selectedGalleryItem = event.event_gallery.find(
        (item) => item.id === req.params.galleryId
      );
      if (selectedGalleryItem) {
        res.json(selectedGalleryItem);
      } else {
        res.status(404).json({ message: 'Gallery item not found' });
      }
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});