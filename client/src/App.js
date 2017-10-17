import React from 'react';
import {AppBar, Toolbar, Typography, Button, IconButton, Drawer, Divider} from 'material-ui';
import MenuIcon from 'material-ui-icons/Menu';
import WebIcon from 'material-ui-icons/Web';
import DescriptionIcon from 'material-ui-icons/Description';
import LibraryBooksIcon from 'material-ui-icons/LibraryBooks';
import HighlightOffIcon from 'material-ui-icons/HighlightOff';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';

import Auth from './auth';
import Login from './auth/login';

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.user = Auth.getUser();
    this.state = {
      logout_open: false,
      anchorEl: null,

      open: false
    };
  }

  logout() {
    Auth.doLogout(); window.location.reload();
  }

  render() {
    if (Auth.getUser())
      return (
        <div>
          <AppBar>
            <Toolbar>
              <IconButton
                color="contrast"
                aria-label="open drawer"
                onClick={() => this.setState({open: true})}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" style={{flex: 1}}>
                DOMJudge
              </Typography>
              <Button color="contrast">
                {this.user.username} &nbsp; <strong>{this.user.teamname}</strong>
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer open={this.state.open} onRequestClose={() => this.setState({open: false})}>
            <div>
              <List style={{width: 250}}>
                <ListItem button>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary="Overview" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <LibraryBooksIcon />
                  </ListItemIcon>
                  <ListItemText primary="Problems" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <WebIcon />
                  </ListItemIcon>
                  <ListItemText primary="Scoreboard" />
                </ListItem>
              </List>
              <Divider />
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <HighlightOffIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" onClick={this.logout} />
                </ListItem>
              </List>
            </div>
          </Drawer>
          <div style={{
            width: '100%', padding: '86px 15px 15px 20px'
          }}>
            <div style={{
              background: '#fafafa',
              border: '1px solid #ebebeb',
              boxShadow: 'rgba(0, 0, 0, 0.14902) 0px 1px 1px 0px, rgba(0, 0, 0, 0.09804) 0px 1px 2px 0px'
            }}>
              <h1>Hello!</h1>
            </div>
          </div>
        </div>
      );
    else
      return (
        <Login />
      );
  }
}

export default App;
