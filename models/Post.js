import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  user: {
    type: "Object-Id",
    ref: "User"
  },
  body: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
      type: Date,
      default: Date.now
  }
});

const Post = mongoose.model("Post", PostSchema);

export default Post;