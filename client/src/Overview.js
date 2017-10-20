import React from 'react';
import PropTypes from 'prop-types';

import {Typography, Grid, Paper} from 'material-ui';
import {LinearProgress} from 'material-ui/Progress';

import Submissions from './components/submissions';

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const styles = {
      title: {paddingTop: 10, paddingBottom: 10, textAlign: 'center'}
    };
    const {contest} = this.props;
    return (
      <Grid container spacing={16}>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                <Typography type="title" style={styles.title}>Submit your solution</Typography>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                {this.state.submission_loading && <LinearProgress />}
                <Typography type="title" style={styles.title}>Submissions</Typography>
                <Submissions
                  contest={contest}
                  toast={this.props.toast}
                  setLoading={val => this.setState({submission_loading: val})} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                <Typography type="title" style={styles.title}>Clarifications</Typography>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                <Typography type="title" style={styles.title}>Clarification Requests</Typography>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Overview.PropTypes = {
  toast: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  contest: PropTypes.object.isRequired,
  state: PropTypes.number.isRequired
};

export default Overview;
