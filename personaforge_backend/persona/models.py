from django.db import models
from django.contrib.postgres.fields import ArrayField

class Persona(models.Model):
    id = models.CharField(primary_key=True, editable=True)
    email = models.EmailField()
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=255)
    pronouns = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    occupation = models.CharField(max_length=255)
    monthly_income = models.IntegerField()
    salary_day_1 = models.IntegerField()
    salary_day_2 = models.IntegerField()
    primary_bank = models.CharField(max_length=255)
    other_banks = ArrayField(models.CharField(max_length=255))
    has_credit_card = models.BooleanField()
    e_wallets = models.CharField(max_length=255)
    preferred_channel = models.CharField(max_length=255)
    language_style =models.CharField(max_length=255)
    goals = ArrayField(models.CharField(max_length=999))
    anti_goals = ArrayField(models.CharField(max_length=999))
    risk_tolerance = models.CharField(max_length=255)
    savings_goal = models.IntegerField()
    consent_personalization = models.CharField(max_length=255)
    accessibility_needs = ArrayField(models.CharField(max_length=999))
    churn_risk = models.CharField(max_length=255)
    
    def __str__(self):
        return f"Persona: {self.id} ({self.name})"




