import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';

import {red, orange, green} from 'material-ui/colors';
import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import Config from '../storages/config';

const score_in_seconds = Config.getConfig('score_in_seconds', 0);
const timeformat = t => {
  if (score_in_seconds){
    const pad2 = v => v < 10 ? '0'+v : v;
    return Math.floor(t/3600)+':'+pad2(Math.floor(t%3600/60))+':'+pad2(t%60);
  }
  else return t;
};
const cellwidth = score_in_seconds ? 70 : 60;
const styles = () => ({
  root: {
    overflowX: 'auto',
    maxWidth: '100%',
  },
  row: {
    textAlign: 'center',
    fontSize: 24,
    display: 'block',
    whiteSpace: 'nowrap',
  },
  rowWrapper: {
    padding: 5,
    display: 'inline-block',
  },
  teamrow: {
    borderRadius: 5,
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.12)',
    }
  },
  cell: {
    display: 'inline-block',
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
    backgroundColor: green[800],
  },
  correct: {
    backgroundColor: green[500],
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

class ScoreboardTable extends React.Component {
  shouldComponentUpdate(nextProps) {
    return JSON.stringify(this.props.scoreboard) !== JSON.stringify(nextProps.scoreboard) ||
           this.current_lng !== nextProps.i18n.language;
  }

  render() {
    this.current_lng = this.props.i18n.language;
    const {scoreboard, t, classes} = this.props;
    const getClassByDetail = e => {
      if (e.is_first) return classes.firstsolve;
      if (e.is_correct) return classes.correct;
      if (e.pending) return classes.pending;
      if (e.submissions) return classes.wrong;
    };
    const getTextWidth = (txt, font) => {
      let element = document.createElement('canvas');
      let context = element.getContext('2d');
      context.font = font;
      return context.measureText(txt).width;
    };
    let teamWidth = 50; // minimum width
    for (let row of scoreboard.scoreboard){
      let name = getTextWidth(row.team.teamname, '24px Roboto');
      let affil = getTextWidth(row.team.affilname, '16px Roboto');
      if (row.team.country) affil += 23; // flag's width
      teamWidth = Math.max(teamWidth, name, affil);
    }
    teamWidth += 20; // because of padding
    return (
      <div className={classes.root}>
        <div className={classes.row}>
          <div className={classes.rowWrapper}>
            <div className={classNames(classes.cell, classes.rank)}>{t('scoreboard.rank')}</div>
            <div className={classNames(classes.cell, classes.team)} style={{width: teamWidth}}>{t('scoreboard.team')}</div>
            {scoreboard.problems.map((e, idx) => (
              <div key={idx} className={classNames(classes.cell, classes.problem)}>
                {e.shortname}
              </div>
            ))}
            <div className={classNames(classes.cell, classes.total)}></div>
          </div>
        </div>
        {scoreboard.scoreboard.map(row => (
          <div className={classes.row} key={row.team.teamid}>
            <div className={classNames(classes.rowWrapper, classes.teamrow)}>
              <div className={classNames(classes.cell, classes.rank, classes.ranktext)}>{row.rank}</div>
              <div className={classNames(classes.cell, classes.team, classes.teaminfo)} style={{backgroundColor: row.team.color, width: teamWidth}}>
                <div className={classes.teamname}>{row.team.teamname}</div>
                <div className={classes.affil}>
                  {row.team.country && <img src={`./flags/${row.team.country}.png`} alt={row.team.country} style={{height: '1em'}} />}
                  {row.team.affilname || '\u00A0'}
                </div>
              </div>
              {row.detail.map((e, idx) => (
                <div key={idx} className={classNames(classes.cell, classes.score, getClassByDetail(e))}>
                  <div className={classes.bignumber}>{e.submissions+e.pending ? e.submissions+e.pending : '\u00A0'}</div>
                  <div className={classes.smallnumber}>{e.is_correct ? timeformat(e.solvetime) : '\u00A0'}</div>
                </div>
              ))}
              <div className={classNames(classes.cell, classes.total)}>
                <div className={classes.bignumber}>{row.points}</div>
                <div className={classes.smallnumber}>{timeformat(row.totaltime)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

ScoreboardTable.PropTypes = {
  scoreboard: PropTypes.object.isRequired,
};

export default withStyles(styles)(translate('translations')(ScoreboardTable));
