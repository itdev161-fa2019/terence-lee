import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./styles.css";

const EditPost = ({token, post, onPostUpdated}) => {
    let history = useHistory();
    const [postData, setPostData] = useState({
        title: post.title,
        body: post.body
    });

    const { title, body } = postData;

    const onChange = e => {
        const { name, value } = e.target;

        setPostData({
            ...postData,
            [name]: value
        });
    };

    const update = async () => {
        if (!title || !body) {
            console.log("Title and body are required")
        } else {
            const newPost = {
                title: title,
                body: body
            };

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token
                    }
                };

                //Update the post
                const body = JSON.stringify(newPost);
                const res = await axios.put(`http://localhost:5000/api/posts/${post._id}`, body, config);

                //Call the handler and redirect
                onPostUpdated(res.data);
                history.push("/");
            }
            catch (error) {
                console.error(`Error creating post: ${error.response.data}`);
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Edit Post</h2>
            <input
                name="title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => onChange(e)}
            />
            <textarea
                name="body"
                rows="30"
                cols="10"
                value={body}
                onChange={e => onChange(e)}
            />
            <button onClick={() => update()}>Submit</button>
        </div>
    );
};

export default EditPost;