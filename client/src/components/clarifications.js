import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import axios from 'axios';

import {Typography} from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Loading from './loading';
import ClarificationDialog from './clarification-dialog';

import Auth from '../storages/auth';

import Logo from '../logo.png';

import {useDesktopNotification} from '../config';

class Clarifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clarifications: [],
    };
    this.viewed = null;
    this.notified = new Set();
  }

  componentDidMount() {
    this.refreshClarification();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest)){
      // If contest has been changed clarification list also has to be changed
      this.viewed = null; this.notified = new Set();
      this.refreshClarification(nextProps.contest);
    }
  }

  refreshClarification(c) {
    const {setLoading, toast, t} = this.props;
    const contest = c || this.props.contest;
    clearTimeout(this.timer);
    setLoading(true);
    axios.get(`./api/clarifications?cid=${contest.cid}`, Auth.getHeader())
      .then(res => {
        let clars = res.data.map(e => {
          e.body = e.body.split('\n').filter(e => e[0] !== '>' && e.trim()[0]).join(' ');
          e.body = e.body[80] ? e.body.slice(0, 80) + '...' : e.body;
          return e;
        });
        /* === Notification START === */
        if (this.viewed){
          for (let clar of clars){
            if (!this.viewed.has(clar.clarid) && !this.notified.has(clar.clarid)){
              this.notified.add(clar.clarid);
              if (useDesktopNotification){
                let n = new Notification(
                  t('notification.new_clarification.title'), {
                    body: t('notification.new_clarification.body', {subject: clar.subject, to: clar.to, body: clar.body}),
                    icon: Logo
                  });
                n.onclick = evt => {
                  window.focus();
                  evt.target.close();
                };
              }
            }
          }
        }
        this.viewed = new Set(clars.map(e => e.clarid));
        /* === Notification END === */
        this.setState({clarifications: clars});
        setLoading(false);
        // Reload clarifications automatically.
        this.timer = setTimeout(this.refreshClarification.bind(this, contest), 30 * 1000);
      })
      .catch(() => toast(t('error')));
  }

  selectClarification(clarid) {
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
  }

  render() {
    const {contest, user, toast, afterSend, t} = this.props;
    const {clarifications} = this.state;

    const formatTime = t => {
      let s = Math.max(Math.floor((t-contest.starttime)/60), 0);
      const pad2 = v => v < 10 ? '0'+v : ''+v;
      return pad2(Math.floor(s/60)) + ':' + pad2(s%60);
    };
    const table = (
      <Table style={{width: '100%'}}>
        <TableHead>
          <TableRow style={{fontSize: 15}}>
            <TableCell padding="none" style={{width:43, textAlign: 'center'}}>{t('clarification.time')}</TableCell>
            <TableCell padding="none" style={{width:53, textAlign: 'center'}}>{t('clarification.from')}</TableCell>
            <TableCell padding="none" style={{width:53, textAlign: 'center'}}>{t('clarification.to')}</TableCell>
            <TableCell padding="none" style={{maxWidth:67, textAlign: 'center'}}>{t('clarification.subject')}</TableCell>
            <TableCell padding="none" style={{textAlign: 'center'}}>{t('clarification.text')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clarifications.map((c, idx) => (
            <TableRow key={idx} hover
              onClick={this.selectClarification.bind(this, c.clarid)}
              style={{
                fontWeight: c.unread ? 800 : 'inherit',
                cursor: 'pointer',
              }}
            >
              <TableCell padding="none" style={{textAlign: 'center'}}>{formatTime(c.submittime)}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}>{c.from}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}>{c.to}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}>{c.subject}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center', whiteSpace: 'pre-wrap', paddingLeft: 10, paddingRight: 10}}>{c.body}</TableCell>
            </TableRow>
          ))}
          {this.state.selected_clarification &&
          <ClarificationDialog
            fullWidth
            maxWidth="sm"
            open={true}
            contest={contest}
            user={user}
            toast={toast}
            clarification={this.state.selected_clarification}
            afterSend={afterSend}
            onRequestClose={() => this.setState({selected_clarification: null})}
          />}
        </TableBody>
      </Table>
    );
    return (
      <div style={{width: '100%'}}>
        {this.state.loading && <Loading />}
        {clarifications.length > 0 ?
          table :
          <Typography type="subheading" style={{textAlign: 'center', fontStyle: 'italic'}}>{t('clarification.no_clarification')}</Typography>}
      </div>
    );
  }
}

Clarifications.propTypes = {
  toast: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  afterSend: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default translate('translations')(Clarifications);
