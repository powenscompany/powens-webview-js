// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Helper to get DOM element by ID
  const $ = (id) => document.getElementById(id);

  // Core form elements
  const form = $('webview-form');
  const flowSelect = $('flow');
  const domainInput = $('domain');
  const clientIdInput = $('clientId');
  const langSelect = $('lang');

  // Output elements
  const codePreview = $('code-preview');
  const copyBtn = $('copy-btn');
  const resultPre = $('result');
  const copyResultBtn = $('copy-result-btn');
  const statusDot = $('status-dot');
  const powensWebview = document.querySelector('powens-webview');

  // Collapsible section
  const optionalSection = $('optional-section');
  const optionalToggle = $('optional-toggle');
  const optionalFlowName = $('optional-flow-name');

  // Fields that can appear in both required and optional sections
  const dualFields = {
    redirectUri: {
      requiredInput: $('redirectUri'),
      requiredGroup: $('redirectUri-group'),
      requiredIndicator: $('redirectUri-required'),
      optionalInput: $('redirectUri-optional'),
      optionalGroup: $('redirectUri-optional-group'),
    },
    code: {
      requiredInput: $('code'),
      requiredGroup: $('code-group'),
      requiredIndicator: $('code-required'),
      optionalInput: $('code-optional'),
      optionalGroup: $('code-optional-group'),
    },
    connectionId: {
      requiredInput: $('connectionId'),
      requiredGroup: $('connectionId-group'),
      requiredIndicator: $('connectionId-required'),
      optionalInput: $('connectionId-optional'),
      optionalGroup: $('connectionId-optional-group'),
    },
  };

  // Simple fields configuration: { inputElement, groupElement, type }
  // type: 'string' | 'number' | 'array' | 'json' | 'boolean' | 'country'
  const simpleFields = {
    paymentId: { input: $('paymentId'), group: $('paymentId-group'), type: 'number' },
    state: { input: $('state'), group: $('state-group'), type: 'string' },
    connectorIds: { input: $('connectorIds'), group: $('connectorIds-group'), type: 'array' },
    connectorUuids: { input: $('connectorUuids'), group: $('connectorUuids-group'), type: 'array' },
    connectorCapabilities: { input: $('connectorCapabilities'), group: $('connectorCapabilities-group'), type: 'array' },
    connectorCountry: { input: $('connectorCountry'), group: $('connectorCountry-group'), type: 'country' },
    accountTypes: { input: $('accountTypes'), group: $('accountTypes-group'), type: 'array' },
    accountIbans: { input: $('accountIbans'), group: $('accountIbans-group'), type: 'array' },
    accountUsages: { input: $('accountUsages'), group: $('accountUsages-group'), type: 'array' },
    connectorFieldValues: { input: $('connectorFieldValues'), group: $('connectorFieldValues-group'), type: 'json' },
    resetCredentials: { input: $('resetCredentials'), group: $('resetCredentials-group'), type: 'boolean' },
    connectionSources: { input: $('connectionSources'), group: $('connectionSources-group'), type: 'array' },
  };

  // Enum mappings for code display
  const FLOW_ENUM = { connect: 'Connect', reconnect: 'Reconnect', manage: 'Manage', payment: 'Payment' };
  const LANG_ENUM = { en: 'English', fr: 'French', de: 'German', nl: 'Dutch', it: 'Italian', es: 'Spanish', pt: 'Portuguese' };

  // Field visibility per flow: 'required' | 'optional' | false
  const FLOW_FIELDS_CONFIG = {
    connect: {
      redirectUri: 'required', code: 'optional', connectionId: false, paymentId: false,
      state: 'optional', connectorIds: 'optional', connectorUuids: 'optional',
      connectorCapabilities: 'optional', connectorCountry: 'optional', accountTypes: 'optional',
      accountIbans: 'optional', accountUsages: 'optional',
      connectorFieldValues: 'optional', resetCredentials: false, connectionSources: false,
    },
    reconnect: {
      redirectUri: 'required', code: 'required', connectionId: 'required', paymentId: false,
      state: 'optional', connectorIds: false, connectorUuids: false, connectorCapabilities: false,
      connectorCountry: false, accountTypes: false, accountIbans: false, accountUsages: false,
      connectorFieldValues: false, resetCredentials: 'optional', connectionSources: 'optional',
    },
    manage: {
      redirectUri: 'optional', code: 'required', connectionId: 'optional', paymentId: false,
      state: 'optional', connectorIds: false, connectorUuids: false, connectorCapabilities: 'optional',
      connectorCountry: 'optional', accountTypes: 'optional', accountIbans: false, accountUsages: 'optional',
      connectorFieldValues: false, resetCredentials: false, connectionSources: false,
    },
    payment: {
      redirectUri: 'required', code: 'required', connectionId: false, paymentId: 'required',
      state: 'optional', connectorIds: false, connectorUuids: false, connectorCapabilities: false,
      connectorCountry: 'optional', accountTypes: false, accountIbans: false, accountUsages: false,
      connectorFieldValues: false, resetCredentials: false, connectionSources: false,
    },
  };

  // Set default redirect URI
  dualFields.redirectUri.requiredInput.value = window.location.origin;

  // Toggle collapsible section
  optionalToggle.addEventListener('click', () => optionalSection.classList.toggle('expanded'));

  // Helpers
  const parseArray = (value) => value?.trim() ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
  const parseJson = (value) => { try { return value?.trim() ? JSON.parse(value) : null; } catch { return null; } };
  const showElement = (el, show) => { if (el) el.style.display = show ? '' : 'none'; };

  // Update visibility of a dual field (required/optional sections)
  function updateDualField(fieldName, configValue) {
    const field = dualFields[fieldName];
    if (!field) return;

    const isRequired = configValue === 'required';
    const isOptional = configValue === 'optional';

    showElement(field.requiredGroup, isRequired);
    showElement(field.optionalGroup, isOptional);

    if (field.requiredIndicator) {
      field.requiredIndicator.textContent = isRequired ? '*' : '';
      showElement(field.requiredIndicator, isRequired);
    }
  }

  // Get value from dual field based on config
  function getDualFieldValue(fieldName, config) {
    const field = dualFields[fieldName];
    if (!field || !config[fieldName]) return null;
    return config[fieldName] === 'required' ? field.requiredInput.value : field.optionalInput.value;
  }

  // Update field visibility based on flow
  function updateFieldVisibility() {
    const config = FLOW_FIELDS_CONFIG[flowSelect.value];
    optionalFlowName.textContent = FLOW_ENUM[flowSelect.value];

    // Update dual fields
    Object.keys(dualFields).forEach(name => updateDualField(name, config[name]));

    // Update simple fields
    Object.entries(simpleFields).forEach(([name, field]) => showElement(field.group, config[name] !== false));

    // Hide optional section if no optional fields visible
    const optionalFieldNames = Object.keys(simpleFields).filter(name => config[name] === 'optional');
    const hasDualOptional = Object.keys(dualFields).some(name => config[name] === 'optional');
    showElement(optionalSection, optionalFieldNames.length > 0 || hasDualOptional);
  }

  // Build options object from form (used for both preview and webview)
  function buildOptions() {
    const flow = flowSelect.value;
    const config = FLOW_FIELDS_CONFIG[flow];

    const options = { flow, domain: domainInput.value, clientId: clientIdInput.value };

    if (langSelect.value) options.lang = langSelect.value;

    // Process dual fields
    Object.keys(dualFields).forEach(name => {
      const value = getDualFieldValue(name, config);
      if (value) {
        options[name] = (name === 'connectionId') ? parseInt(value, 10) : value;
      }
    });

    // Process simple fields
    Object.entries(simpleFields).forEach(([name, field]) => {
      if (!config[name]) return;

      const input = field.input;
      let value;

      switch (field.type) {
        case 'string':
          value = input.value || null;
          break;
        case 'number':
          value = input.value ? parseInt(input.value, 10) : null;
          break;
        case 'country':
          value = input.value ? input.value.toUpperCase() : null;
          break;
        case 'array':
          const arr = parseArray(input.value);
          value = arr.length ? arr : null;
          break;
        case 'json':
          value = parseJson(input.value);
          break;
        case 'boolean':
          value = input.checked || null;
          break;
      }

      if (value) options[name] = value;
    });

    return options;
  }

  // Generate code preview string
  function generateCodePreview(options) {
    const lines = [];

    lines.push(`  flow: PowensWebviewFlow.${FLOW_ENUM[options.flow]},`);
    if (options.domain) lines.push(`  domain: "${options.domain}",`);
    if (options.clientId) lines.push(`  clientId: "${options.clientId}",`);
    if (options.lang) lines.push(`  lang: PowensWebviewLanguage.${LANG_ENUM[options.lang]},`);

    // String fields
    ['redirectUri', 'code', 'state'].forEach(key => {
      if (options[key]) lines.push(`  ${key}: "${options[key]}",`);
    });

    // Number fields
    ['connectionId', 'paymentId'].forEach(key => {
      if (options[key]) lines.push(`  ${key}: ${options[key]},`);
    });

    // Country field (special case with uppercase)
    if (options.connectorCountry) {
      lines.push(`  connectorCountry: "${options.connectorCountry}",`);
    }

    // Array fields
    ['connectorIds', 'connectorUuids', 'connectorCapabilities', 'accountTypes', 'accountIbans', 'accountUsages', 'connectionSources'].forEach(key => {
      if (options[key]?.length) lines.push(`  ${key}: ${JSON.stringify(options[key])},`);
    });

    // JSON field
    if (options.connectorFieldValues) {
      const formatted = JSON.stringify(options.connectorFieldValues, null, 4).replace(/\n/g, '\n  ');
      lines.push(`  connectorFieldValues: ${formatted},`);
    }

    // Boolean field
    if (options.resetCredentials) lines.push(`  resetCredentials: true,`);

    return `webview.options = {\n${lines.join('\n')}\n};`;
  }

  function updateCodePreview() {
    codePreview.textContent = generateCodePreview(buildOptions());
  }

  // Copy to clipboard with feedback
  function copyWithFeedback(button, getText) {
    navigator.clipboard.writeText(getText());
    const original = button.innerHTML;
    button.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
    setTimeout(() => { button.innerHTML = original; }, 2000);
  }

  // Open webview
  function openWebview(event) {
    event.preventDefault();
    resultPre.textContent = 'Waiting for webview response...';
    resultPre.classList.remove('has-data');
    statusDot.classList.remove('active');
    copyResultBtn.hidden = true;

    powensWebview.options = buildOptions();
    powensWebview.openWebview();
  }

  // Handle webview completion
  window.addEventListener('message', (event) => {
    if (event.origin !== window.origin || event.data.type !== 'powensWebviewTermination') return;

    copyResultBtn.hidden = false;
    statusDot.classList.add('active');
    resultPre.classList.add('has-data');
    resultPre.textContent = JSON.stringify(event.data.data, null, 2);
  });

  // Event listeners
  form.addEventListener('submit', openWebview);
  copyBtn.addEventListener('click', () => copyWithFeedback(copyBtn, () => codePreview.textContent));
  copyResultBtn.addEventListener('click', () => copyWithFeedback(copyResultBtn, () => resultPre.textContent));
  flowSelect.addEventListener('change', () => { updateFieldVisibility(); updateCodePreview(); });

  // Watch all inputs for code preview updates
  const allInputs = [
    domainInput, clientIdInput, langSelect,
    ...Object.values(dualFields).flatMap(f => [f.requiredInput, f.optionalInput]),
    ...Object.values(simpleFields).map(f => f.input),
  ].filter(Boolean);

  allInputs.forEach(input => {
    input.addEventListener('input', updateCodePreview);
    input.addEventListener('change', updateCodePreview);
  });

  // Initial setup
  updateFieldVisibility();
  updateCodePreview();
}