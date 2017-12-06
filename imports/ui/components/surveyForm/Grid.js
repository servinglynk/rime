import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Item from './Item';

export default class Grid extends Item {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, type, date, name) {
    if (type === 'date') {
      // this is a date picker event
      this.props.onChange(name, date ? date.format('YYYY-MM-DD') : '');
    } else {
      this.props.onChange(event.target.name, event.target.value);
    }
  }

  renderHeader() {
    const { columns, id } = this.props.item;
    const items = columns.map(c => (<td key={c.id}>{c.title}</td>));
    return (
      <tr>
        <td key={`#${id}`}>#</td>{items}
      </tr>
    );
  }

  renderCell(r, c, disabled) {
    const values = this.props.formState.values;
    const { columns } = this.props.item;
    const item = columns[c];
    const cellId = `${item.id}[${r}]`;
    const cellValue = values[item.id] && values[item.id][r];
    switch (item.category) {
      case 'date':
        return (
          <DatePicker
            selected={cellValue ? moment(cellValue) : ''}
            onChange={(value, event) => this.handleChange(event, item.category, value, cellId)}
            placeholderText="MM/DD/YYYY"
            disabled={disabled}
          />
        );
      default:
        return (
          <input
            type={item.category || 'text'}
            id={cellId}
            name={cellId}
            value={cellValue || ''}
            onChange={this.handleChange}
            disabled={disabled}
          />
        );
    }
  }

  renderRows(disabled) {
    const { columns, id } = this.props.item;
    const numRows = this.props.formState.props[`${id}.rows`] || this.props.item.rows;
    const empty = new Array(numRows).fill(0);
    const rows = empty.map((_, i) => {
      const row = columns.map((c, j) => (
        <td key={`${id}-${i}-${j}`}>{this.renderCell(i, j, disabled)}</td>)
      );
      return (
        <tr key={`${id}-${i}`}>
          <td key={`#${i}`}>{i + 1}</td>
          {row}
        </tr>
      );
    });
    return rows;
  }

  render() {
    const { id, text } = this.props.item;
    const disabled = this.props.formState.props[`${id}.skip`];

    return (
      <div className="grid item">
        {this.renderTitle()}
        <p>{text}</p>
        <table>
          <thead>
            {this.renderHeader()}
          </thead>
          <tbody>
            {this.renderRows(disabled)}
          </tbody>
        </table>
      </div>
    );
  }
}