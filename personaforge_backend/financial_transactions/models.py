from django.db import models

class FinancialTransaction(models.Model):
    persona_id = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100, unique=True)
    timestamp = models.DateTimeField()
    transaction_type = models.CharField(max_length=20, choices=[
        ("Debit", "Debit"),
        ("Credit", "Credit"),
    ])
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    category = models.CharField(max_length=50)
    merchant = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50)
    account_type = models.CharField(max_length=50, choices=[
        ("Savings", "Savings"),
        ("Checking", "Checking"),
        ("Credit", "Credit"),
    ])
    channel = models.CharField(max_length=255)
    balance_after_transaction = models.DecimalField(max_digits=14, decimal_places=2)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "financial_transactions"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.transaction_id} | {self.persona_id} | {self.amount}"
