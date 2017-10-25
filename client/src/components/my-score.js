import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import axios from 'axios';

import ScoreboardTable from './scoreboard-table';

import Auth from '../storages/auth';

class MyScore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      info: null,
    };
  }

  componentDidMount() {
    this.refreshScore();
  }

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest) ||
        this.props.sbidx !== nextProps.sbidx){
      this.refreshScore(nextProps.contest);
    }
    return true;
  }

  refreshScore(c) {
    const contest = c || this.props.contest;
    const {setLoading, toast, t} = this.props;
    setLoading(true);
    axios.post('./api/scoreboard/my', {
      cid: contest.cid
    }, Auth.getHeader())
      .then(res => {
        this.setState({info: res.data});
        setLoading(false);
      })
      .catch(() => toast(t('error')));
  }

  render() {
    const {info} = this.state;
    let scoreboard = null;
    if (info){
      scoreboard = {scoreboard: [info]};
      scoreboard.problems = [];
      for (let c of info.detail) scoreboard.problems.push({probid: c.probid, shortname: c.shortname});
    }
    else return '';
    return (
      <ScoreboardTable scoreboard={scoreboard} />
    );
  }
}

MyScore.PropTypes = {
  toast: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export default translate('translations')(MyScore);
