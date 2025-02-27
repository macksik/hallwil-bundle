class AgeVerification extends HTMLElement {
  constructor() {
    super();
    this.currentYear = new Date().getFullYear();
    this.months = Array.from({length: 12}, (_, i) => {
      const month = new Date(2000, i).toLocaleString('default', { month: 'long' });
      return { value: i + 1, label: month };
    });
    this.years = Array.from({length: 120}, (_, i) => this.currentYear - i);
  }

  getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  updateDays() {
    const monthSelect = this.querySelector('#birth-month');
    const yearSelect = this.querySelector('#birth-year');
    const daySelect = this.querySelector('#birth-day');
    
    if (!monthSelect.value || !yearSelect.value) return;
    
    const daysInMonth = this.getDaysInMonth(monthSelect.value, yearSelect.value);
    const currentDay = daySelect.value;
    
    daySelect.innerHTML = `
      <option value="" disabled ${!currentDay ? 'selected' : ''}>Day</option>
      ${Array.from({length: daysInMonth}, (_, i) => {
        const day = i + 1;
        return `<option value="${day}" ${currentDay == day ? 'selected' : ''}>${day}</option>`;
      }).join('')}
    `;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.hideOriginalCheckout();
  }

  render() {
    this.innerHTML = `
      <div class="age-verification">
        <label class="age-verification__label">${window.cartStrings?.age_verification || 'Please verify your age'}</label>
        <div class="age-verification__selects">
          <div class="age-verification__select-wrapper">
            <select id="birth-day" class="age-verification__select" required>
              <option value="" disabled selected>Day</option>
              ${Array.from({length: 31}, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
            </select>
          </div>
          <div class="age-verification__select-wrapper">
            <select id="birth-month" class="age-verification__select" required>
              <option value="" disabled selected>Month</option>
              ${this.months.map(month => `<option value="${month.value}">${month.label}</option>`).join('')}
            </select>
          </div>
          <div class="age-verification__select-wrapper">
            <select id="birth-year" class="age-verification__select" required>
              <option value="" disabled selected>Year</option>
              ${this.years.map(year => `<option value="${year}">${year}</option>`).join('')}
            </select>
          </div>
        </div>
        <p class="age-verification__error" style="display: none;"></p>
        <button
          type="button"
          id="checkout-button"
          class="cart__checkout-button button"
          ${this.dataset.cartEmpty === 'true' ? 'disabled' : ''}
        >
          ${window.cartStrings?.checkout || 'Check out'}
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    const checkoutButton = this.querySelector('#checkout-button');
    const monthSelect = this.querySelector('#birth-month');
    const yearSelect = this.querySelector('#birth-year');

    checkoutButton.addEventListener('click', () => this.validateAge());
    monthSelect.addEventListener('change', () => this.updateDays());
    yearSelect.addEventListener('change', () => this.updateDays());
  }

  hideOriginalCheckout() {
    const originalCheckout = document.querySelector('button[name="checkout"]');
    if (originalCheckout) {
      originalCheckout.style.display = 'none';
    }
  }

  validateAge() {
    const day = this.querySelector('#birth-day').value;
    const month = this.querySelector('#birth-month').value;
    const year = this.querySelector('#birth-year').value;
    const errorElement = this.querySelector('.age-verification__error');

    if (!day || !month || !year) {
      this.showError(window.cartStrings?.please_enter_birthdate || 'Please enter your birthdate');
      return false;
    }

    const birthdate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }

    if (age < 18) {
      this.showError(window.cartStrings?.must_be_18 || 'You must be at least 18 years old to purchase');
      return false;
    }

    errorElement.style.display = 'none';
    const checkoutButton = document.querySelector('button[name="checkout"]');
    if (checkoutButton) {
      checkoutButton.click();
    } else {
      document.getElementById('cart').submit();
    }
  }

  showError(message) {
    const errorElement = this.querySelector('.age-verification__error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

customElements.define('age-verification', AgeVerification);