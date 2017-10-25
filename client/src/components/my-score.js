import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import axios from 'axios';

import {red, lightGreen, orange} from 'material-ui/colors';
import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import Auth from '../storages/auth';

const cellwidth = 60;
const styles = () => ({
  root: {
    overflowX: 'scroll',
    maxWidth: '100%',
  },
  container: {
    textAlign: 'center',
    fontSize: 24,
  },
  row: {
    display: 'block',
    whiteSpace: 'nowrap',
    margin: '5px 0px',
  },
  cell: {
    display: 'inline-block',
    textAlign: 'center',
    padding: '5px 0px',
    verticalAlign: 'top',
  },
  rank: {
    width: 70,
    marginRight: 3,
  },
  ranktext: {
    padding: '16px 0px',
  },
  team: {
    width: 350,
    paddingLeft: 10, paddingRight: 10,
    marginLeft: 3, marginRight: 3,
    textAlign: 'center',
  },
  teaminfo: {
    borderRadius: 5,
  },
  teamname: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  affil: {
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  problem: {
    width: cellwidth,
    marginLeft: 3, marginRight: 3,
  },
  score: {
    width: cellwidth,
    marginLeft: 3, marginRight: 3,
    borderRadius: 5,
    color: '#fff',
  },
  firstsolve: {
    backgroundColor: lightGreen['A700'],
  },
  correct: {
    backgroundColor: lightGreen[400],
  },
  wrong: {
    backgroundColor: red[400],
  },
  pending: {
    backgroundColor: orange[400],
  },
  total: {
    width: cellwidth,
    margin: '0px 3px',
  },
  bignumber: {
    fontWeight: 'bold',
  },
  smallnumber: {
    fontSize: 16
  },
});

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
    const {t, classes} = this.props;
    const {info} = this.state;
    const getClassByDetail = e => {
      if (e.is_first) return classes.firstsolve;
      if (e.is_correct) return classes.correct;
      if (e.pending) return classes.pending;
      if (e.submissions) return classes.wrong;
    };
    return (
      <div className={classes.root}>
        {info && <div className={classes.container}>
          <div className={classes.row}>
            <div className={classNames(classes.cell, classes.rank)}>{t('scoreboard.rank')}</div>
            <div className={classNames(classes.cell, classes.team)}>{t('scoreboard.team')}</div>
            {info.detail.map((e, idx) => (
              <div key={idx} className={classNames(classes.cell, classes.problem)}>
                {e.shortname}
              </div>
            ))}
            <div className={classNames(classes.cell, classes.total)}></div>
          </div>
          <div className={classes.row}>
            <div className={classNames(classes.cell, classes.rank, classes.ranktext)}>{info.rank}</div>
            <div className={classNames(classes.cell, classes.team, classes.teaminfo)}>
              <div className={classes.teamname}>{info.teamname}</div>
              <div className={classes.affil}>
                {(info.affil && info.affil.country) && <img src={`./flags/${info.affil.country}.png`} alt={info.affil.country} style={{height: '1em'}} />}
                {(info.affil && info.affil.name) || '\u00A0'}
              </div>
            </div>
            {info.detail.map((e, idx) => (
              <div key={idx} className={classNames(classes.cell, classes.score, getClassByDetail(e))}>
                <div className={classes.bignumber}>{e.submissions+e.pending ? e.submissions+e.pending : '\u00A0'}</div>
                <div className={classes.smallnumber}>{e.is_correct ? e.totaltime : '\u00A0'}</div>
              </div>
            ))}
            <div className={classNames(classes.cell, classes.total)}>
              <div className={classes.bignumber}>{info.points}</div>
              <div className={classes.smallnumber}>{info.totaltime}</div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}

MyScore.PropTypes = {
  toast: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  setLoading: PropTypes.func.isRequired,
};

export default withStyles(styles)(translate('translations')(MyScore));
