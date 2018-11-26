import React, { Component } from 'react';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {data: ''};
  }

  login() {
    this.props.auth.login();
  }

  componentDidMount() {
    fetch('https://3u45jn2xtd.execute-api.eu-west-1.amazonaws.com/prod/api', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(response => response.json())
    .then(json => this.setState({data: json.data}))
    .catch(error => this.setState({data: error.message}));
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className="container">
        {
          isAuthenticated() && (
            <div>
              <h4>
                Du er logget inn!
              </h4>
              <p>{this.state.data}</p>
              </div>
            )
        }
        {
          !isAuthenticated() && (
              <h4>
               Du er ikke logget inn!{' '}
                <a
                  style={{ cursor: 'pointer' }}
                  onClick={this.login.bind(this)}
                >
                  Logg inn
                </a>
                {' '}for å fortsette.
              </h4>
            )
        }
      </div>
    );
  }
}

export default Home;
