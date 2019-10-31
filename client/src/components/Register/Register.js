import React, {useState} from 'react';
import axios from 'axios';

const Register = () => {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    const { name, email, password, passwordConfirm } = userData;

    const onChange = e => {
        const { name, value } = e.target;
        setUserData({
            ...userData,
            [name]: value
        })
    }

    const register = async () => {
        if (password !== passwordConfirm) {
            console.log("Password don't match");
        }
        else {
            const newUser = {
                name: name,
                email: email,
                password: password
            };

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

                const body = JSON.stringify(newUser);
                const res = await axios.post("http://localhost:5000/api/users", body, config);
                console.log(res.data);
            }
            catch (error) {
                console.error(error.response.data);
                //return;
            }
        }
    }

    return (
        <div>
            <h2>Register</h2>
            <div>
                <input type="text" placeholder="Name" name="name" value={name} onChange={e => onChange(e)} />
            </div>
            <div>
                <input type="text" placeholder="Email" name="email" value={email} onChange={e => onChange(e)} />
            </div>
            <div>
                <input type="text" placeholder="Password" name="password" value={password} onChange={e => onChange(e)} />
            </div>
            <div>
                <input type="text" placeholder="Confirm Password" name="passwordConfirm" value={passwordConfirm} onChange={e => onChange(e)} />
            </div>
            <div>
                <button onClick={() => register()}>Register</button>
            </div>
        </div>
    )
};


export default Register;