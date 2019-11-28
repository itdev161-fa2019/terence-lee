import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import Post from "./components/Post/Post";
import PostList from "./components/PostList/PostList";
import CreatePost from "./components/Post/CreatePost";
import EditPost from "./components/Post/EditPost";

class App extends React.Component {
  state = {
    posts: [],
    post: null,
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

  viewPost = post => {
    console.log(`View ${post.title}`);
    this.setState({
      post: post
    });
  };

  deletePost = post => {
    const {token} = this.state;

    if(token) {
      const config = {
        headers: {
          "x-auth-token": token
        }
      };

      axios
        .delete(`http://localhost:5000/api/posts/${post._id}`, config)
        .then(response => {
          const newPosts = this.state.posts.filter(p => p._id !== post._id);
          this.setState({
            posts: [...newPosts]
          });
        })
        .catch(error => {
          console.error(`Error deleting post: ${error}`);
        })
    }
  };

  editPost = post => {
    this.setState({
      post: post
    });
  };

  onPostCreated = post => {
    const newPosts = [...this.state.posts, post];

    this.setState({
      posts: newPosts
    });
  };

  onPostUpdated = post => {
    console.log(`Updated post: ${post}`);
    const newPosts = [...this.state.posts];
    const index = newPosts.findIndex(p => p._id === post._id);

    newPosts[index] = post;

    this.setState({
      posts: newPosts
    });
  };

  logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.setState({user: null, token: null});
  };

  render() {
    let {user, posts, post, token} = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    };

    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>GoodThings</h1>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                {user ? (
                  <Link to="/new-post">New Post</Link>
                ) : (
                  <Link to = "/register">Register</Link>
                )}
              </li>
              <li>
                {user ? (
                  <Link to="" onClick={this.logOut}>
                    Log out
                  </Link>
                ) : (
                  <Link to="/login">Login</Link>
                )}
              </li>
            </ul>
          </header>
          <main>
            <Switch>
              <Route exact path="/">
                {user ? (
                  <React.Fragment>
                    <div>Hello, {user}!</div>
                    <PostList 
                      posts={posts} 
                      clickPost={this.viewPost} 
                      deletePost={this.deletePost} 
                      editPost={this.editPost}
                    />
                  </React.Fragment>
                ) : (
                  <React.Fragment>Please Register or Login</React.Fragment>
                )}
              </Route>
              <Route path="/posts/:postId">
                  <Post post={post}/>
              </Route>
              <Route path="/new-post">
                <CreatePost token={token} onPostCreated={this.onPostCreated}/>
              </Route>
              <Route path="/edit=post/:postId">
                <EditPost token={token} post={post} onPostUpdated={this.onPostUpdated}/>
              </Route>
              <Route
                exact
                path="/register"
                render={() => <Register {...authProps} />}
              />
              <Route
                exact
                path="/login"
                render={() => <Login {...authProps} />}
              />
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
