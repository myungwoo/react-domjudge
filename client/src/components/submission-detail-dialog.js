import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from 'material-ui';
import Button from 'material-ui/Button';
import Dialog, {
  withResponsiveFullScreen,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText
} from 'material-ui/Dialog';

let ResponsiveDialog = withResponsiveFullScreen()(Dialog);

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
      let color = '#F44336';
      if (r === 'correct') color = '#4CAF50';
      if (r === 'pending' || r === 'too-late') color = '#9E9E9E';
      return (<span style={{color, fontSize: 12, fontWeight: 600, textTransform: 'uppercase'}}>{r}</span>);
    };
    const styles = {
      code: {
        borderTop: '1px dotted #c0c0c0',
        borderBottom: '1px dotted #c0c0c0',
        backgroundColor: '#fafafa',
        padding: 5,
        fontFamily: 'monospace',
        overflowX: 'scroll',
        whiteSpace: 'pre',
      },
    };
    return (
      <ResponsiveDialog {...rest}>
        <DialogTitle>Submission details</DialogTitle>
        <DialogContent>
          {!submission.valid ?
            <DialogContentText>This submission is being ignored. It is not used in determining your score.</DialogContentText>
            :
            <div>
              <table>
                <tbody>
                  <tr><td>Problem:</td><td>{submission.shortname} - {submission.probname}</td></tr>
                  <tr><td>Submitted:</td><td>{formatTime(submission.submittime)}</td></tr>
                  <tr><td>Language:</td><td>{submission.langname}</td></tr>
                  <tr><td>Result:</td><td>{formatResult(submission.result)}</td></tr>
                </tbody>
              </table>
              {typeof(submission.output_compile) === 'string' &&
              <div style={{paddingTop: 15}}>
                <Typography type="title" style={{paddingBottom: 10}}>Compilation output</Typography>
                {submission.output_compile.length > 0 ?
                  <pre style={styles.code}>{submission.output_compile}</pre>
                  :
                  <Typography type="subheading" style={{fontStyle: 'italic'}}>There were no compiler errors or warnings.</Typography>
                }
              </div>
              }
              {submission.sample_runs &&
              <div style={{paddingTop: 10}}>
                <Typography type="title" style={{paddingBottom: 10}}>Run(s) on the provided sample data</Typography>
                {submission.sample_runs.length > 0 ?
                  submission.sample_runs.map((e, idx) => (
                    <div key={idx} style={{paddingLeft: 10}}>
                      <Typography type="subheading" style={{fontWeight: 'bold'}}>Run {e.rank}</Typography>
                      {e.runresult ?
                        <div style={{padding: 3}}>
                          <table style={{fontSize: 14}}>
                            <tbody>
                              <tr><td>Description:</td><td>{e.description}</td></tr>
                              <tr><td>Runtime:</td><td>{e.runtime}</td></tr>
                              <tr><td>Result:</td><td>{formatResult(e.runresult)}</td></tr>
                            </tbody>
                          </table>
                          {[{m: e.output_run, t: 'Program output', b: 'There was no program output.'}, {m: e.output_diff, t: 'Diff output', b: 'There was no diff output.'}, {m: e.output_error, t: 'Error output (info/debug/error)', b: 'There was no stderr output.'}].map(({m, t, b}, i) => (
                            <div key={i}>
                              <Typography type="body2" style={{fontWeight: 'bold'}}>{t}</Typography>
                              {m ?
                                <pre style={styles.code}>{m}</pre>
                                :
                                <Typography type="body1" style={{fontStyle: 'italic', marginTop: 13, marginBottom: 13}}>{b}</Typography>
                              }
                            </div>
                          ))}
                        </div>
                        :
                        <Typography type="body2" style={{fontStyle: 'italic'}}>Run not finished yet.</Typography>
                      }
                    </div>
                  ))
                  :
                  <Typography type="subheading" style={{fontStyle: 'italic'}}>No sample cases available.</Typography>
                }
              </div>
              }
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </ResponsiveDialog>
    );
  }
}

SubmissionDetailDialog.propTypes = {
  submission: PropTypes.object.isRequired, // dict
  contest: PropTypes.object.isRequired, // dict
  onRequestClose: PropTypes.func.isRequired,
};

export default SubmissionDetailDialog;
