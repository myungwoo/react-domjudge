import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {translate} from 'react-i18next';

import {Typography} from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Loading from './loading';
import SubmissionDetailDialog from './submission-detail-dialog';

import Auth from '../storages/auth';

import Logo from '../logo.png';

class Submissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
    };
    this.notified = new Set();
    this.pendings = [];
  }

  componentDidMount() {
    this.refreshSubmission();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest) ||
        JSON.stringify(this.props.sidx) !== JSON.stringify(nextProps.sidx)){
      // If contest has been changed submission list also has to be changed
      this.refreshSubmission(nextProps.contest);
    }
  }

  componentDidUpdate() {
    const {t} = this.props;
    const {submissions} = this.state;
    let pendings = [];
    for (let sid of this.pendings){
      let s = submissions[submissions.map(e => e.submitid).indexOf(sid)];
      if (s && s.result){
        if (!this.notified.has(sid)){
          this.notified.add(sid);
          let n = new Notification(
            t('notification.new_result.title'), {
              body: t('notification.new_result.body', {shortname: s.shortname, result: s.result.toUpperCase()}),
              icon: Logo
            });
          n.onclick = evt => {
            window.focus();
            evt.target.close();
          };
        }
      }else pendings.push(sid);
    }
    this.pendings = submissions.filter(e => !e.result).map(e => e.submitid);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  refreshSubmission(c) {
    const {setLoading, onUpdate, toast, t} = this.props;
    const contest = c || this.props.contest;
    clearTimeout(this.timer);
    setLoading(true);
    axios.post('./api/submissions', {
      cid: contest.cid
    }, Auth.getHeader())
      .then(res => {
        this.setState({submissions: res.data});
        onUpdate();
        setLoading(false);
        // If there's pending submission reload automatically.
        if (res.data.map(e => e.result).includes(null))
          this.timer = setTimeout(this.refreshSubmission.bind(this, contest), 4000);
      })
      .catch(() => toast(t('error')));
  }

  selectSubmission(submitid) {
    const {toast, t} = this.props;
    this.setState({loading: true});
    axios.post('./api/submission', {
      submitid
    }, Auth.getHeader())
      .then(res => {
        if (!res.data) toast(t('submissions.not_found'));
        else this.refreshSubmission();
        this.setState({loading: false, selected_submission: res.data});
      })
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  }

  render() {
    const {contest, t} = this.props;
    const {submissions} = this.state;

    const formatTime = t => {
      let s = Math.max(Math.floor((t-contest.starttime)/60), 0);
      const pad2 = v => v < 10 ? '0'+v : ''+v;
      return pad2(Math.floor(s/60)) + ':' + pad2(s%60);
    };
    const formatResult = r => {
      r = r || 'pending';
      let color = '#F44336';
      if (r === 'correct') color = '#4CAF50';
      if (r === 'pending' || r === 'too-late') color = '#9E9E9E';
      return (<span style={{color}}>{r}</span>);
    };

    const clickAble = s => (
      s.submittime < contest.endtime && s.result && s.valid
    );
    const table = (
      <Table style={{width: '100%'}}>
        <TableHead>
          <TableRow style={{fontSize: 15}}>
            <TableCell padding="none" style={{width:70, textAlign: 'center'}}>{t('submissions.time')}</TableCell>
            <TableCell padding="none" style={{width:88, textAlign: 'center'}}>{t('submissions.problem')}</TableCell>
            <TableCell padding="none" style={{width:98, textAlign: 'center'}}>{t('submissions.language')}</TableCell>
            <TableCell padding="none" style={{textAlign: 'center'}}>{t('submissions.result')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map(s => (
            <TableRow key={s.submitid} hover
              onClick={clickAble(s) ? this.selectSubmission.bind(this, s.submitid) : null}
              style={{
                fontWeight: s.seen ? 'inherit' : 800,
                cursor: clickAble(s) ? 'pointer' : 'inherit',
                textDecoration: s.valid ? 'none' : 'line-through',
              }}
            >
              <TableCell padding="none" style={{textAlign: 'center'}}>{formatTime(s.submittime)}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{s.shortname}</span></TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{s.langid}</span></TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{formatResult(s.result)}</span></TableCell>
            </TableRow>
          ))}
          {this.state.selected_submission &&
          <SubmissionDetailDialog
            maxWidth="md"
            open={true}
            submission={this.state.selected_submission}
            contest={contest}
            onRequestClose={() => this.setState({selected_submission: null})}
          />}
        </TableBody>
      </Table>
    );
    return (
      <div style={{width: '100%'}}>
        {this.state.loading && <Loading />}
        {submissions.length > 0 ?
          table :
          <Typography type="subheading" style={{textAlign: 'center', fontStyle: 'italic'}}>{t('submissions.no_submissions')}</Typography>}
      </div>
    );
  }
}

Submissions.propTypes = {
  toast: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
};

export default translate('translation')(Submissions);
