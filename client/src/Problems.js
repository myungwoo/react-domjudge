import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import axios from 'axios';

import {Route, Switch, Redirect} from 'react-router-dom';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText, ListSubheader } from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';

import Loading from './components/loading';
import ProblemView from './components/problem-view';

import Auth from './storages/auth';

const problemSidebarWidth = 250;

class Problems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problems: [],
    };
  }

  componentDidMount() {
    this.refreshList();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest) ||
        this.props.state !== nextProps.state){
      this.refreshList(nextProps.contest);
    }
  }

  componentDidUpdate() {
    if (this.state.redirect_to)
      this.setState({redirect_to: null});
  }

  refreshList(c) {
    const contest = c || this.props.contest;
    const {toast, t} = this.props;
    this.setState({loading: true});
    axios.get(`./api/problems?cid=${contest.cid}&withtext`, Auth.getHeader())
      .then(res => {
        this.setState({loading: false, problems: res.data});
      })
      .catch(() => toast(t('error')));
  }

  render() {
    const {contest, toast, state, t} = this.props;
    const {loading, problems, redirect_to} = this.state;
    return (
      <Grid container spacing={16} style={{padding: 14}}>
        {(loading && <Loading />) || ''}
        {redirect_to && <Redirect to={redirect_to} />}
        {(state && problems && problems[0] &&
        <Grid item xs={12} style={{height: 'calc(100vh - 86px)'}}>
          <Paper style={{height: '100%'}}>
            <div style={{height: '100%', width: problemSidebarWidth, display: 'inline-block', verticalAlign: 'top'}}>
              <List subheader={<ListSubheader style={{background: '#fff'}}>{t('problems.title')}</ListSubheader>} style={{width: '100%', maxHeight: '100%', overflow: 'auto'}}>
                {problems.map((e, idx) => (
                  <ListItem button key={idx} onClick={() => this.setState({redirect_to: '/problems/'+e.shortname})}>
                    <Avatar>{e.shortname}</Avatar>
                    <ListItemText primary={e.name} />
                  </ListItem>
                ))}
              </List>
            </div>
            <div style={{height: '100%', width: `calc(100% - ${problemSidebarWidth}px)`, display: 'inline-block', verticalAlign: 'top'}}>
              <Switch>
                <Route exact path="/problems" render={props =>
                  (<ProblemView {...props} contest={contest} toast={toast} problem={problems[0]} />)} />
                {problems.map((e, idx) => (
                  <Route key={idx} exact path={'/problems/'+e.shortname} render={props =>
                    (<ProblemView {...props} contest={contest} toast={toast} problem={e} />)} />
                ))}
                <Redirect to="/problems" />
              </Switch>
            </div>
          </Paper>
        </Grid>) || ''}
        {(state && (!problems || !problems[0]) && !loading &&
        <Grid item xs={12}>
          <Switch>
            <Route exact path="/problems" render={() =>
              (<Paper>
                <Typography type="headline" style={{fontStyle: 'italic', textAlign: 'center', padding: 16}}>{t('problems.no_problem_texts')}</Typography>
              </Paper>)} />
            <Redirect to="/problems" />
          </Switch>
        </Grid>) || ''}
        {(!state &&
        <Grid item xs={12}>
          <Switch>
            <Route exact path="/problems" render={() =>
              (<Paper>
                <Typography type="headline" style={{fontStyle: 'italic', textAlign: 'center', padding: 16}}>{t('problems.contest_not_starts')}</Typography>
              </Paper>)} />
            <Redirect to="/problems" />
          </Switch>
        </Grid>) || ''}
      </Grid>
    );
  }
}

Problems.PropTypes = {
  toast: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  contest: PropTypes.object.isRequired,
  state: PropTypes.number.isRequired,
};

export default translate('translations')(Problems);
