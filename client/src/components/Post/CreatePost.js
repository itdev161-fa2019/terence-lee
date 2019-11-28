import React, {useState} from "react";
import axios from "axios";
import {useHistory} from "react-router-dom";
import "./styles.css";

const CreatePost = ({token, onPostCreated}) => {
    let history = useHistory();
    const [postData, setPostData] = useState({
        title: "",
        body: ""
    });

    const {title, body} = postData;

    const onChange = e => {
        const {name, value} = e.target;

        setPostData({
            ...postData,
            [name]: value
        });
    };

    const create = async () => {
        if(!title || !body){
            console.log("Title and body are required")
        } else {
            const newPost = {
                title: title,
                body: body
            };

            try{
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token
                    }
                };

                //Create the post
                const body = JSON.stringify(newPost);
                const res = await axios.post("http://localhost:5000/api/posts", body, config);

                //Call the handler and redirect
                onPostCreated(res.data);
                history.push("/");
            }
            catch(error){
                console.error(`Error creating post: ${error.response.data}`);
            }
        }
    };

    return(
        <div className="form-container">
            <h2>Create New Post</h2>
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
            <button onClick={() => create()}>Submit</button>
        </div>
    );
};

export default CreatePost;