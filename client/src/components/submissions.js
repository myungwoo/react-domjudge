import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import {Typography} from 'material-ui';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import Auth from '../storages/auth';

class Submissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
    };
  }

  componentDidMount() {
    this.refreshSubmission();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest)){
      // If contest has been changed submission list also has to be changed
      this.refreshSubmission(nextProps.contest);
    }
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) ||
           JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  refreshSubmission(c) {
    const {setLoading, toast} = this.props;
    const contest = c || this.props.contest;
    setLoading(true);
    axios.post('/api/submissions', {
      cid: contest.cid
    }, Auth.getHeader())
      .then(res => {
        this.setState({submissions: res.data});
        setLoading(false);
      })
      .catch(() => toast('Something went wrong, please reload the app.'));
  }

  render() {
    const {contest} = this.props;
    const {submissions} = this.state;

    const formatTime = t => {
      let s = Math.max(Math.floor((t-contest.starttime)/60), 0);
      const pad2 = v => v < 10 ? '0'+v : ''+v;
      return pad2(Math.floor(s/60)) + ':' + pad2(s%60);
    };
    const formatResult = r => {
      r = r || 'pending';
      let color = 'red';
      if (r === 'correct') color = 'green';
      if (r === 'pending' || r === 'too-late') color = 'gray';
      return (<span style={{color}}>{r}</span>);
    };
    const table = (
      <Table style={{width: '100%'}}>
        <TableHead>
          <TableRow style={{fontSize: 15}}>
            <TableCell padding="none" style={{width:70, textAlign: 'center'}}>Time</TableCell>
            <TableCell padding="none" style={{width:88, textAlign: 'center'}}>Problem</TableCell>
            <TableCell padding="none" style={{width:98, textAlign: 'center'}}>Language</TableCell>
            <TableCell padding="none" style={{textAlign: 'center'}}>Result</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map(s => (
            <TableRow key={s.submitid} hover
              style={{fontWeight: s.seen ? 'inherit' : 800, cursor: 'pointer'}}
            >
              <TableCell padding="none" style={{textAlign: 'center'}}>{formatTime(s.submittime)}</TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{s.shortname}</span></TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{s.langid}</span></TableCell>
              <TableCell padding="none" style={{textAlign: 'center'}}><span style={{textTransform: 'uppercase'}}>{formatResult(s.result)}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
    return (
      <div style={{width: '100%'}}>
        {submissions.length > 0 ?
          table :
          <Typography type="subheading" style={{textAlign: 'center'}}>No submissions</Typography>}
      </div>
    );
  }
}

Submissions.propTypes = {
  toast: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
};

export default Submissions;
