export const EmailTypeEnum = {
  ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  ORDER_CANCELLATION: 'ORDER_CANCELLATION',
  CONTACT_FORM: 'CONTACT_FORM',
  NEWSLETTER: 'NEWSLETTER',
  MARKETING: 'MARKETING'
};

export const EmailStatusEnum = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED'
};

export const getEmailTypeColor = (type) => {
  switch (type) {
    case EmailTypeEnum.ORDER_CONFIRMATION:
      return 'success';
    case EmailTypeEnum.ORDER_STATUS_UPDATE:
      return 'info';
    case EmailTypeEnum.ORDER_CANCELLATION:
      return 'error';
    case EmailTypeEnum.CONTACT_FORM:
      return 'primary';
    case EmailTypeEnum.NEWSLETTER:
      return 'secondary';
    case EmailTypeEnum.MARKETING:
      return 'default';
    default:
      return 'default';
  }
};

export const getEmailStatusColor = (status) => {
  switch (status) {
    case EmailStatusEnum.SENT:
      return 'success';
    case EmailStatusEnum.DELIVERED:
      return 'primary';
    case EmailStatusEnum.OPENED:
      return 'info';
    case EmailStatusEnum.CLICKED:
      return 'secondary';
    case EmailStatusEnum.FAILED:
      return 'error';
    case EmailStatusEnum.BOUNCED:
      return 'error';
    case EmailStatusEnum.PENDING:
      return 'warning';
    default:
      return 'default';
  }
};
