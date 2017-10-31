import React from 'react';
import PropTypes from 'prop-types';
import {translate, Trans} from 'react-i18next';
import axios from 'axios';

import Button from 'material-ui/Button';

import Loading from './loading';

import Auth from '../storages/auth';

class ProblemView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
    };
  }

  componentDidMount() {
    this.refreshProblem();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.problem) !== JSON.stringify(nextProps.problem)){
      this.refreshProblem(nextProps.problem);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.url !== nextState.url)
      window.URL.revokeObjectURL(this.state.url);
    return true;
  }
  
  refreshProblem(p) {
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
  }

  render() {
    const {problem, t} = this.props;
    const {url, loading} = this.state;
    return (
      <div style={{height: '100%'}}>
        {loading && <Loading />}
        <div>
          <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}>
            <Button raised color="primary" style={{width: '100%'}}>{t('problem_view.download')}</Button>
          </a>
        </div>
        <object data={url} type="application/pdf" style={{width: '100%', height: 'calc(100% - 36px)'}}>
          <Trans i18nKey="problem_view.cant_view">
            If you can't view PDF file in browser,
            <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}>
              <span style={{color: 'blue', textDecoration: 'underline'}}>
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

export default translate('translations')(ProblemView);
