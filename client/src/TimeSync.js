class TimeSyncClass {
  constructor() {
    this.timediff = 0; // Servertime - localtime
  }

  setTimediff(diff) { this.timediff = diff; }
  getNow = () => Date.now()+this.timediff;
}

const TimeSync = new TimeSyncClass();

export default TimeSync;
