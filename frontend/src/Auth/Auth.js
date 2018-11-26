import history from '../history';
import { AUTH_CONFIG } from './oidc-variables';

export default class Auth {
  
  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
  }

  generateNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
      return text;
  }

  login() {
    const authorizeUri = `${AUTH_CONFIG.domain}?scope=${AUTH_CONFIG.scope}&acr_values=${AUTH_CONFIG.acrValues}&client_id=${AUTH_CONFIG.clientId}&redirect_uri=${AUTH_CONFIG.redirectUri}&response_type=${AUTH_CONFIG.responseType}&nonce=${this.generateNonce()}&ui_locales=${AUTH_CONFIG.locale}`
    window.location = authorizeUri;
  }

  getParameterByName(name) {
    var match = RegExp('[#&]' + name + '=([^&]*)').exec(window.location.hash);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  
  getAccessToken() {
    return this.getParameterByName('access_token');
  }
  
  getIdToken() {
    return this.getParameterByName('id_token');
  }

  getExpiresIn() {
    return this.getParameterByName('expires_in');
  }

  handleAuthentication() {
    const accessToken = this.getAccessToken();
    const idToken = this.getIdToken();
    const expiresIn = this.getExpiresIn();

    if (accessToken && idToken) {
      this.setSession({
        accessToken: accessToken,
        idToken: idToken,
        expiresIn: expiresIn
      });
      history.replace('/home');
    } else {
      history.replace('/home');
      console.log('Ingen access_token eller id_token');
      alert(`Error: Ingen access_token eller id_token.`);
    }
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // navigate to the home route
    history.replace('/home');
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    history.replace('/home');
  }

  isAuthenticated() {
    // Check whether the current time is past the 
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}
