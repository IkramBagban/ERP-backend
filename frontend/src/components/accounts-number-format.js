const AccountsNumberFormat = ({amount}) => {
    const number_format = new Intl.NumberFormat('en-US',
    {
            style                   : 'currency',
            currency                : 'USD',
            currencyDisplay         : "symbol",
            currencySign            : 'accounting',
            minimumFractionDigits   : 2,
            maximumFractionDigits   : 2
    });

    return (
        amount == 0?'-':number_format.format(amount).replace('$', '')
    );
}

AccountsNumberFormat.defaultProps = {
    amount: 0
}

export default  AccountsNumberFormat
