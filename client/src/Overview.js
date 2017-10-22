import React from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import {Typography, Grid, Paper} from 'material-ui';
import {LinearProgress} from 'material-ui/Progress';

import Submissions from './components/submissions';
import SubmitForm from './components/submit-form';
import Clarifications from './components/clarifications';

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const styles = {
      title: {paddingTop: 10, paddingBottom: 10, textAlign: 'center'}
    };
    const {contest, user, state, toast} = this.props;
    let {sidx} = this.state;
    const start_date = moment(contest.starttime * 1000);
    const now = moment();
    let start_date_display;
    if (start_date.format('YYYYMMDD') === now.format('YYYYMMDD')) // today
      start_date_display = start_date.format('HH:mm:ss');
    else
      start_date_display = start_date.format('ddd D MMM YYYY HH:mm:ss');
    return (
      <Grid container spacing={16}>
        {state === 0 &&
        <Grid item xs={12}>
          <Paper style={{padding: 16, textAlign: 'center'}}>
            <Typography type="display1">Welcome, <span style={{fontWeight: 700}}>{user.teamname}</span>!</Typography>
            <Typography type="headline">contest is scheduled to start on {start_date_display}</Typography>
          </Paper>
        </Grid>}
        {state === 2 &&
        <Grid item xs={12}>
          <Paper style={{padding: 16, textAlign: 'center'}}>
            <Typography type="display1">Contest has been finished!!</Typography>
          </Paper>
        </Grid>}
        <Grid item xs={12} md={6}>
          <Grid container>
            {state !== 0 && <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                {this.state.submitform_loading && <LinearProgress />}
                <Typography type="title" style={styles.title}>Submit your solution</Typography>
                <SubmitForm
                  afterSubmit={() => this.setState({sidx: (sidx && ++sidx) || 1})}
                  contest={contest}
                  toast={toast}
                  setLoading={val => this.setState({submitform_loading: val})} />
              </Paper>
            </Grid>}
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                {this.state.submission_loading && <LinearProgress />}
                <Typography type="title" style={styles.title}>Submissions</Typography>
                <Submissions
                  sidx={sidx}
                  contest={contest}
                  toast={toast}
                  setLoading={val => this.setState({submission_loading: val})} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={12}>
              <Paper style={{padding: 16}}>
                {this.state.clarifications_loading && <LinearProgress />}
                <Typography type="title" style={styles.title}>Clarifications</Typography>
                <Clarifications
                  contest={contest}
                  toast={toast}
                  user={user}
                  setLoading={val => this.setState({clarifications_loading: val})} />
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
  state: PropTypes.number.isRequired,
};

export default Overview;
