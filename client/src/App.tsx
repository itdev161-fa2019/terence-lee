import React from 'react';
import './App.css';
import axios from 'axios';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

class App extends React.Component {
  state = {
    data: null
  }

  componentDidMount() {
    axios.get("http://localhost:5000")
      .then((response) => {
        this.setState({
          data: response.data
        })
      }).catch((error) => {
        console.error(`Error fetching data: ${error}`);
      })
  }

  render() {
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
                <Link to="/register"></Link>
              </li>
              <li>
                <Link to="/login"></Link>
              </li>
            </ul>
        </header>
        <main>
          <Route exact path="/">
              {this.state.data}
          </Route>
          <Switch>
            <Route path="/register">
              Register
            </Route>
            <Route path="/login">
              Login
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
    );
  }
}

export default App;
