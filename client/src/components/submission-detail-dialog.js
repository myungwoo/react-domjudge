import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';

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
    // eslint-disable-next-line no-unused-vars
    const {submission, contest, t, i18n, ...rest} = this.props;
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
        <DialogTitle>{t('submission_detail_dialog.title')}</DialogTitle>
        <DialogContent>
          {!submission.valid ?
            <DialogContentText>{t('submission_detail_dialog.invalid_submission')}</DialogContentText>
            :
            <div>
              <table>
                <tbody>
                  <tr><td>{t('submission_detail_dialog.problem')}:</td><td>{submission.shortname} - {submission.probname}</td></tr>
                  <tr><td>{t('submission_detail_dialog.submitted_time')}:</td><td>{formatTime(submission.submittime)}</td></tr>
                  <tr><td>{t('submission_detail_dialog.language')}:</td><td>{submission.langname}</td></tr>
                  <tr><td>{t('submission_detail_dialog.result')}:</td><td>{formatResult(submission.result)}</td></tr>
                </tbody>
              </table>
              {typeof(submission.output_compile) === 'string' &&
              <div style={{paddingTop: 15}}>
                <Typography type="title" style={{paddingBottom: 10}}>{t('submission_detail_dialog.compile_output')}</Typography>
                {submission.output_compile.length > 0 ?
                  <pre style={styles.code}>{submission.output_compile}</pre>
                  :
                  <Typography type="subheading" style={{fontStyle: 'italic'}}>{t('submission_detail_dialog.no_compile_output')}</Typography>
                }
              </div>
              }
              {submission.sample_runs &&
              <div style={{paddingTop: 10}}>
                <Typography type="title" style={{paddingBottom: 10}}>{t('submission_detail_dialog.sample_runs')}</Typography>
                {submission.sample_runs.length > 0 ?
                  submission.sample_runs.map((e, idx) => (
                    <div key={idx} style={{paddingLeft: 10}}>
                      <Typography type="subheading" style={{fontWeight: 'bold'}}>{t('submission_detail_dialog.run_rank', {rank: e.rank})}</Typography>
                      {e.runresult ?
                        <div style={{padding: 3}}>
                          <table style={{fontSize: 14}}>
                            <tbody>
                              <tr><td>{t('submission_detail_dialog.description')}:</td><td>{e.description}</td></tr>
                              <tr><td>{t('submission_detail_dialog.runtime')}:</td><td>{e.runtime}</td></tr>
                              <tr><td>{t('submission_detail_dialog.result')}:</td><td>{formatResult(e.runresult)}</td></tr>
                            </tbody>
                          </table>
                          {[{m: e.output_run, t: t('submission_detail_dialog.program_output'), b: t('submission_detail_dialog.no_program_output')},
                            {m: e.output_diff, t: t('submission_detail_dialog.diff_output'), b: t('submission_detail_dialog.no_diff_output')},
                            {m: e.output_error, t: t('submission_detail_dialog.stderr_output'), b: t('submission_detail_dialog.no_stderr_output')}].map(({m, t, b}, i) => (
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
                        <Typography type="body2" style={{fontStyle: 'italic'}}>{t('submission_detail_dialog.run_not_finished')}</Typography>
                      }
                    </div>
                  ))
                  :
                  <Typography type="subheading" style={{fontStyle: 'italic'}}>{t('submission_detail_dialog.no_sample_case')}</Typography>
                }
              </div>
              }
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            {t('submission_detail_dialog.close')}
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

export default translate('translations')(SubmissionDetailDialog);
