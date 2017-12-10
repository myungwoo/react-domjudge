import React from 'react';
import PropTypes from 'prop-types';
import {translate, Trans} from 'react-i18next';
import {withStyles} from 'material-ui/styles';
import classNames from 'classnames';

import axios from 'axios';

import Button from 'material-ui/Button';

import Loading from './loading';

import Auth from '../storages/auth';

const styles = () => ({
  fullWidth: {width: '100%'},
  halfWidth: {width: '50%'},
  fullHeight: {height: '100%'},
  fitHeight: {height: 'calc(100% - 36px)'},
  download: {color: 'blue', textDecoration: 'underline'},
});

class ProblemView extends React.PureComponent {
  state = {
    url: null,
  };

  componentDidMount() {
    this.refreshProblem();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.problem) !== JSON.stringify(nextProps.problem)){
      this.refreshProblem(nextProps.problem);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.url !== prevState.url && prevState.url)
      window.URL.revokeObjectURL(prevState.url);
  }
  
  refreshProblem = p => {
    const problem = p || this.props.problem;
    const {toast, contest, t} = this.props;
    this.setState({loading: true});
    axios.get(`./api/problemtext/${problem.probid}?cid=${contest.cid}`, {responseType: 'arraybuffer', ...Auth.getHeader()})
      .then(res => {
        let blob = new Blob([res.data], {type: 'application/pdf'});
        let url = window.URL.createObjectURL(blob);
        this.setState({loading: false, url});
      })
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  };

  render() {
    const {problem, t, classes} = this.props;
    const {url, loading} = this.state;
    return (
      <div className={classes.fullHeight}>
        {loading && <Loading />}
        <div>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button raised color="default" className={classes.halfWidth}>{t('problem_view.link')}</Button>
          </a>
          <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}>
            <Button raised color="primary" className={classes.halfWidth}>{t('problem_view.download')}</Button>
          </a>
        </div>
        <object data={url} type="application/pdf" className={classNames(classes.fullWidth, classes.fitHeight)}>
          <Trans i18nKey="problem_view.cant_view">
            If you can't view PDF file in browser,
            <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}>
              <span className={classes.download}>
                download it!
              </span>
            </a>
          </Trans>
        </object>
      </div>
    );
  }
}

ProblemView.PropTypes = {
  toast: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  problem: PropTypes.number.isRequired,
};

export default withStyles(styles)(translate('translations')(ProblemView));
