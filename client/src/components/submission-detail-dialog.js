import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';

class SubmissionDetailDialog extends React.Component {
  render() {
    const {submission, contest, ...rest} = this.props;
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
    return (
      <Dialog {...rest}>
        <DialogTitle>Submission details</DialogTitle>
        <DialogContent>
          <table>
            <tr><td>Problem:</td><td>{submission.shortname} - {submission.probname}</td></tr>
            <tr><td>Submitted:</td><td>{formatTime(submission.submittime)}</td></tr>
            <tr><td>Language:</td><td>{submission.langname}</td></tr>
            <tr><td>Result:</td><td><span style={{textTransform: 'uppercase'}}>{formatResult(submission.result)}</span></td></tr>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SubmissionDetailDialog.propTypes = {
  submission: PropTypes.object.isRequired, // dict
  contest: PropTypes.object.isRequired, // dict
  onRequestClose: PropTypes.func.isRequired,
};

export default SubmissionDetailDialog;
