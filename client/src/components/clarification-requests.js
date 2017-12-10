import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import axios from 'axios';

import {Typography, Button} from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Loading from './loading';
import ClarificationDialog from './clarification-dialog';

import Auth from '../storages/auth';

import {formatTime} from '../Helper';

const styles = () => ({
  fullWidth: {width: '100%'},
  bigFont: {fontSize: 15},
  center: {textAlign: 'center'},
  time: {width: 43},
  from: {width: 53},
  subject: {maxWidth: 67},
  body: {whiteSpace: 'pre-wrap'},
  unread: {fontWeight: 800},
  click: {cursor: 'pointer'},
  buttonWrapper: {width: '100%', textAlign: 'right'},
  noClar: {textAlign: 'center', fontStyle: 'italic'},
});

class ClarificationRequests extends React.PureComponent {
  state = {
    clarifications: [],
  };

  componentDidMount() {
    this.refreshClarification();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest) ||
        JSON.stringify(this.props.cidx) !== JSON.stringify(nextProps.cidx)){
      // If contest has been changed clarification request list also has to be changed
      this.refreshClarification(nextProps.contest);
    }
  }

  refreshClarification = c => {
    const {setLoading, toast, t} = this.props;
    const contest = c || this.props.contest;
    setLoading(true);
    axios.get(`./api/clarifications/my?cid=${contest.cid}`, Auth.getHeader())
      .then(res => {
        let clars = res.data.map(e => {
          e.body = e.body.split('\n').filter(e => e[0] !== '>' && e.trim()[0]).join(' ');
          e.body = e.body[80] ? e.body.slice(0, 80) + '...' : e.body;
          return e;
        });
        this.setState({clarifications: clars});
        setLoading(false);
      })
      .catch(() => toast(t('error')));
  };

  selectClarification = clarid => () => {
    const {toast, t} = this.props;
    this.setState({loading: true});
    axios.get(`./api/clarification/${clarid}`, Auth.getHeader())
      .then(res => {
        this.setState({loading: false, selected_clarification: res.data});
        this.refreshClarification();
      })
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  };

  selectNothing = () => this.setState({selected_clarification: {}});
  closeDialog = () => this.setState({selected_clarification: null});

  render() {
    const {contest, user, toast, t, classes} = this.props;
    const {clarifications} = this.state;
    const table = (
      <Table className={classes.fullWidth}>
        <TableHead>
          <TableRow className={classes.bigFont}>
            <TableCell padding="none" className={classNames(classes.time, classes.center)}>{t('clarification.time')}</TableCell>
            <TableCell padding="none" className={classNames(classes.from, classes.center)}>{t('clarification.from')}</TableCell>
            <TableCell padding="none" className={classNames(classes.from, classes.center)}>{t('clarification.to')}</TableCell>
            <TableCell padding="none" className={classNames(classes.subject, classes.center)}>{t('clarification.subject')}</TableCell>
            <TableCell padding="none" className={classes.center}>{t('clarification.text')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clarifications.map((c, idx) => (
            <TableRow key={idx} hover
              onClick={this.selectClarification(c.clarid)}
              className={classNames(c.unread && classes.unread, classes.click)}
            >
              <TableCell padding="none" className={classes.center}>{formatTime(contest.starttime, c.submittime)}</TableCell>
              <TableCell padding="none" className={classes.center}>{c.from}</TableCell>
              <TableCell padding="none" className={classes.center}>{c.to}</TableCell>
              <TableCell padding="none" className={classes.center}>{c.subject}</TableCell>
              <TableCell padding="none" className={classNames(classes.center, classes.body)}>{c.body}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
    return (
      <div className={classes.fullWidth}>
        {this.state.loading && <Loading />}
        <div className={classes.buttonWrapper}>
          <Button dense raised onClick={this.selectNothing}>{t('clarification.request')}</Button>
        </div>
        {clarifications.length > 0 ?
          table :
          <Typography type="subheading" className={classes.noClar}>{t('clarification.no_clarification_request')}</Typography>}
        {this.state.selected_clarification &&
        <ClarificationDialog
          fullWidth
          maxWidth="sm"
          open
          contest={contest}
          user={user}
          toast={toast}
          clarification={this.state.selected_clarification}
          afterSend={this.refreshClarification}
          onRequestClose={this.closeDialog}
        />}
      </div>
    );
  }
}

ClarificationRequests.propTypes = {
  toast: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

export default withStyles(styles)(translate('translations')(ClarificationRequests));
