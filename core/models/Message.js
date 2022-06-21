import mongoose from 'mongoose';

const Message = new mongoose.Schema({
	actor: String,
	text: String,
})

export default mongoose.model('Message', Message)