export const EmailTypeEnum = {
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  WELCOME: 'WELCOME',
  PROMOTIONAL: 'PROMOTIONAL',
  NEWSLETTER: 'NEWSLETTER',
  CONTACT_FORM: 'CONTACT_FORM'
};

export const EmailStatusEnum = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING'
};

export const getEmailTypeColor = (type) => {
  switch (type) {
    case EmailTypeEnum.ORDER_CONFIRMATION:
      return 'success';
    case EmailTypeEnum.ORDER_SHIPPED:
      return 'info';
    case EmailTypeEnum.ORDER_DELIVERED:
      return 'primary';
    case EmailTypeEnum.ORDER_CANCELLED:
      return 'error';
    case EmailTypeEnum.PASSWORD_RESET:
      return 'warning';
    case EmailTypeEnum.WELCOME:
      return 'secondary';
    case EmailTypeEnum.PROMOTIONAL:
      return 'default';
    case EmailTypeEnum.NEWSLETTER:
      return 'default';
    case EmailTypeEnum.CONTACT_FORM:
      return 'default';
    default:
      return 'default';
  }
};

export const getEmailStatusColor = (status) => {
  switch (status) {
    case EmailStatusEnum.SENT:
      return 'success';
    case EmailStatusEnum.FAILED:
      return 'error';
    case EmailStatusEnum.PENDING:
      return 'warning';
    case EmailStatusEnum.RETRYING:
      return 'info';
    default:
      return 'default';
  }
};
