import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import axios from 'axios';

import moment from 'moment';

import {LinearProgress} from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import ScoreboardTable from './components/scoreboard-table';

import Auth from './storages/auth';
import TimeSync from './TimeSync';

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      problems: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.refreshScoreboard();
  }

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest) ||
        this.props.state !== nextProps.state){
      this.refreshScoreboard(nextProps.contest);
    }
    return true;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  refreshScoreboard(c) {
    const contest = c || this.props.contest;
    const {toast, t} = this.props;
    clearTimeout(this.timer);
    this.setState({loading: true});
    axios.post('./api/scoreboard', {cid: contest.cid}, Auth.getHeader())
      .then(res => {
        this.setState({loading: false, scoreboard: res.data});
        // Reload scoreboard automatically.
        this.timer = setTimeout(this.refreshScoreboard.bind(this, contest), 10 * 1000);
      })
      .catch(() => toast(t('error')));
  }

  render() {
    const {contest, state, t} = this.props;
    const {loading, scoreboard} = this.state;
    let frozen_date_display = '';
    if (contest.freezetime){
      const frozen_date = moment(contest.freezetime * 1000);
      const now = moment(TimeSync.getNow());
      if (frozen_date.format('YYYYMMDD') === now.format('YYYYMMDD')) // today
        frozen_date_display = frozen_date.format(t('scoreboard.near_date_format'));
      else
        frozen_date_display = frozen_date.format(t('scoreboard.far_date_format'));
    }
    return (
      <Grid container spacing={16}>
        {(state && scoreboard &&
        <Grid item xs={12} style={{textAlign: 'center'}}>
          <Paper style={{padding: 16, display: 'inline-block', maxWidth: '100%'}}>
            {loading && <LinearProgress />}
            <Typography type="display1" style={{textAlign: 'center', color: '#000000'}}>
              {scoreboard.final ? t('scoreboard.title_final') : t('scoreboard.title')}
              {scoreboard.frozen &&
              <span style={{color: '#BDBDBD', fontSize: 26}}> ({t('scoreboard.frozen')})</span>}
            </Typography>
            {scoreboard.frozen &&
            <Typography type="headline" style={{textAlign: 'center', color: '#9E9E9E'}}>
              {t('scoreboard.frozen_date', {date: frozen_date_display})}
            </Typography>}
            <ScoreboardTable scoreboard={scoreboard} />
          </Paper>
        </Grid>) || ''}
        {((!state || loading) && !scoreboard &&
        <Grid item xs={12}>
          <Paper style={{padding: 16}}>
            {loading && <LinearProgress />}
            {!state && <Typography type="headline" style={{fontStyle: 'italic', textAlign: 'center', padding: 16}}>{t('scoreboard.contest_not_starts')}</Typography>}
          </Paper>
        </Grid>) || ''}
      </Grid>
    );
  }
}

Scoreboard.PropTypes = {
  toast: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  state: PropTypes.number.isRequired,
};

export default translate('translations')(Scoreboard);
