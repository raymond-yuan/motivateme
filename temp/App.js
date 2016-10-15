import React from 'react';
import ReactDOM from 'react-dom';
import DateRangePicker from 'DateRangePicker';
// class App extends React.Component {
//   render() {
//     return <div>Hello</div>
//   }
// }

// var userData = {raymond: [{task1:"task1"}], sumeet: [task1:"task1"]};
// var taskData = {task1: {deadline: "10.15.2016", action: "eat"}};


class App extends React.Component {

  constructor(props) {
    var d = new Date();
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {items: [], text: '', deadline: ''};
  }

  render() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={this.state.items} />
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} value={this.state.text} />
          <button>{'Add #' + (this.state.items.length + 1)}</button>
        </form>
        <div>
          <DateRangePickerWrapper />
        </div>
      </div>
    );
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    var date = new Date()
    var newItem = {
      // user: userData.raymond,
      text: this.state.text,
      id: Date.now(),
      current: date.getMonth().toString() + "/" +
                date.getDate() + "/" +
                date.getFullYear(),
      deadline: this.state.deadline
    };
    if (newItem.text.length > 0) {
      this.setState((prevState) => ({
        items: prevState.items.concat(newItem),
        text: '',
        dead: ''
      }));
    }
  }
}

class TodoList extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(item => (
          <li key={item.id}>{item.text, item.deadline}</li>
        ))}
      </ul>
    );
  }
}

class DateRangePickerWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
      startDate: null,
      endDate: null,
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state;
    return (
      <div>
        <DateRangePicker
          {...this.props}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    );
  }
}



export default App
