import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import {Typography} from 'material-ui';
import Button from 'material-ui/Button';
import Dialog, {
  withResponsiveFullScreen,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText
} from 'material-ui/Dialog';

import SyntaxHighlighter from 'react-syntax-highlighter';
import {googlecode} from 'react-syntax-highlighter/dist/styles';

import {formatTime} from '../Helper';

let ResponsiveDialog = withResponsiveFullScreen()(Dialog);

const styles = () => ({
  corret: {color: '#4CAF50', fontSize: 12, fontWeight: 600, textTransform: 'uppercase'},
  wrong: {color: '#F44336', fontSize: 12, fontWeight: 600, textTransform: 'uppercase'},
  pending: {color: '#9E9E9E', fontSize: 12, fontWeight: 600, textTransform: 'uppercase'},
  code: {
    borderTop: '1px dotted #c0c0c0',
    borderBottom: '1px dotted #c0c0c0',
    backgroundColor: '#fafafa',
    padding: 5,
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  lgPaddingTop: {paddingTop: 15},
  paddingTop: {paddingTop: 10},
  paddingBottom: {paddingBottom: 10},
  paddingLeft: {paddingLeft: 10},
  smPadding: {padding: 3},
  italic: {fontStyle: 'italic'},
  bold: {fontWeight: 'bold'},
  font14: {fontSize: 14},
  marginTopBottom: {marginTop: 13, marginBottom: 13},
});

class SubmissionDetailDialog extends React.PureComponent {
  state = {ftab: 0};

  formatResult = r => {
    r = r || 'pending';
    let ret = this.props.classes.wrong;
    if (r === 'correct') ret = this.props.classes.correct;
    if (r === 'pending' || r === 'too-late') ret = this.props.classes.pending;
    return (<span className={ret}>{r}</span>);
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {submission, contest, t, i18n, classes, ...rest} = this.props;
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
                  <tr><td>{t('submission_detail_dialog.submitted_time')}:</td><td>{formatTime(contest.starttime, submission.submittime)}</td></tr>
                  <tr><td>{t('submission_detail_dialog.language')}:</td><td>{submission.langname}</td></tr>
                  <tr><td>{t('submission_detail_dialog.result')}:</td><td>{this.formatResult(submission.result)}</td></tr>
                </tbody>
              </table>
              {typeof(submission.output_compile) === 'string' &&
              <div className={classes.lgPaddingTop}>
                <Typography type="title" className={classes.paddingBottom}>{t('submission_detail_dialog.compile_output')}</Typography>
                {submission.output_compile.length > 0 ?
                  <pre className={classes.code}>{submission.output_compile}</pre>
                  :
                  <Typography type="subheading" className={classes.italic}>{t('submission_detail_dialog.no_compile_output')}</Typography>
                }
              </div>
              }
              {submission.sample_runs &&
              <div className={classes.paddingTop}>
                <Typography type="title" className={classes.paddingBottom}>{t('submission_detail_dialog.sample_runs')}</Typography>
                {submission.sample_runs.length > 0 ?
                  submission.sample_runs.map((e, idx) => (
                    <div key={idx} className={classes.paddingLeft}>
                      <Typography type="subheading" className={classes.bold}>{t('submission_detail_dialog.run_rank', {rank: e.rank})}</Typography>
                      {e.runresult ?
                        <div className={classes.smPadding}>
                          <table className={classes.font14}>
                            <tbody>
                              <tr><td>{t('submission_detail_dialog.description')}:</td><td>{e.description}</td></tr>
                              <tr><td>{t('submission_detail_dialog.runtime')}:</td><td>{e.runtime}</td></tr>
                              <tr><td>{t('submission_detail_dialog.result')}:</td><td>{this.formatResult(e.runresult)}</td></tr>
                            </tbody>
                          </table>
                          {[{m: e.output_run, t: t('submission_detail_dialog.program_output'), b: t('submission_detail_dialog.no_program_output')},
                            {m: e.output_diff, t: t('submission_detail_dialog.diff_output'), b: t('submission_detail_dialog.no_diff_output')},
                            {m: e.output_error, t: t('submission_detail_dialog.stderr_output'), b: t('submission_detail_dialog.no_stderr_output')}].map(({m, t, b}, i) => (
                            <div key={i}>
                              <Typography type="body2" className={classes.bold}>{t}</Typography>
                              {m ?
                                <pre className={classes.code}>{m}</pre>
                                :
                                <Typography type="body1" className={classNames(classes.italic, classes.marginTopBottom)}>{b}</Typography>
                              }
                            </div>
                          ))}
                        </div>
                        :
                        <Typography type="body2" className={classes.italic}>{t('submission_detail_dialog.run_not_finished')}</Typography>
                      }
                    </div>
                  ))
                  :
                  <Typography type="subheading" className={classes.italic}>{t('submission_detail_dialog.no_sample_case')}</Typography>
                }
              </div>
              }
              {submission.files &&
              <div className={classes.paddingTop}>
                <Typography type="title">{t('submission_detail_dialog.submitted_file', {count: submission.files.length})}</Typography>
                {submission.files.map((e, idx) => (
                  <div key={idx}>
                    <Typography type="subheading" className={classes.paddingTop}>{e.filename}</Typography>
                    <SyntaxHighlighter
                      showLineNumbers
                      style={googlecode}
                      customStyle={{borderRadius: 5, margin: 0}}
                    >
                      {e.sourcecode}
                    </SyntaxHighlighter>
                  </div>
                ))}
              </div>}
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

export default withStyles(styles)(translate('translations')(SubmissionDetailDialog));
