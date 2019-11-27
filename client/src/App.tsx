import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';


class App extends React.Component {
  state = {
    posts: [],
    token: null,
    user: null
  };

  componentDidMount() {
      this.authenticateUser();
  }

  loadData = () => {
    const {token} = this.state;

    if(token) {
      const config = {
        headers: {
          "x-auth-token": token
        }
      };

      axios.get("http://localhost:5000/api/posts", config)
        .then((response) => {
          this.setState({
            posts: response.data
          })
        }).catch((error) => {
          console.error(`Error fetching data: ${error}`);
        })
    } 
  };

  authenticateUser = () => {
    const token = localStorage.getItem("token");

    if(!token) {
      localStorage.removeItem("token");
      this.setState({user: null});
    }

    if(token) {
      const config = {
        headers: {
          "x-auth-token": token
        }
      };

      axios.get("http://localhost:5000/api/auth", config)
      .then((response) => {
        localStorage.setItem("user", response.data.name);
        this.setState({
            user: response.data.name,
            token: token
          }, () => this.loadData());
      })
      .catch((error) => {
        localStorage.removeItem("token");
        this.setState({ user: null });
        console.error(`Error logging in: ${error}`);
      });
    }
  };

  logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.setState({user: null, token: null});
  };

  render() {
    let {user, posts} = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    };

    return (
      <Router>
        <div className = "App">
        <header className="App-header">
            <h1>GoodThings</h1>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                {
                  user ? 
                  <Link to="" onClick={this.logOut}>Log out</Link> :
                  <Link to="/login">Login</Link>
                }
              </li>
            </ul>
        </header>
        <main>
          <Route exact path="/">
            {
              user ?
                <React.Fragment>
                  <div>Hello, {user}!</div>
                  <div>{posts.map(post => (
                    <div key={post._id}>
                      <h1>{post.title}</h1>
                      <p>{post.body}</p>
                    </div>
                    ))}
                  </div>
                </React.Fragment> :
                <React.Fragment>
                  Please Register or Login
                </React.Fragment>
            }
          </Route>
          <Switch>
            <Route exact path="/register" render={() => <Register {...authProps}/>} />
            <Route exact path="/login" render={() => <Login {...authProps} />} />
          </Switch>
        </main>
      </div>
    </Router>
    );
  }
}

export default App;
