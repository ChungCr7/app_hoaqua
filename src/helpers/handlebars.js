const Handlebars = require('handlebars');

module.exports = {
  sum: (a, b) => a + b,
  sub: (a, b) => a - b,
  multiplication: (a, b) => {
    const n1 = Number(a);
    const n2 = Number(b);
    if (isNaN(n1) || isNaN(n2)) return 0;
    return n1 * n2;
  },
  
  division: (a, b) => b !== 0 ? a / b : 'NaN',
  formatCurrency: (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },
  ifEquals: function (a, b, options) {
    return a == b ? options.fn(this) : options.inverse(this);
  },
  sortable: (field, sort) => {
    const sortType = field === sort.column ? sort.type : 'default';

    const icons = {
      default: 'oi oi-elevator',
      asc: 'oi oi-sort-ascending',
      desc: 'oi oi-sort-descending',
    };
    const types = {
      default: 'desc',
      asc: 'desc',
      desc: 'asc'
    };

    const icon = icons[sortType];
    const type = types[sortType];

    const href = Handlebars.escapeExpression(`?_sort&column=${field}&type=${type}`);

    const output = `<a href="${href}">
      <span class="${icon}"></span>
    </a>`;

    return new Handlebars.SafeString(output);
  }
};
