"""
Finpluse NLP Intent Classifier for AI Copilot
Uses TF-IDF + Logistic Regression to detect intent.
"""
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

INTENT_DATASET = [
    # AFFORD
    ("can I afford to buy a new phone for ₹20,000", "AFFORD"),
    ("is it safe to purchase a car", "AFFORD"),
    ("do I have enough cash for a 5000 dinner", "AFFORD"),
    ("can i afford this", "AFFORD"),
    ("buy tickets to europe", "AFFORD"),
    ("can i drop 10000 on shopping", "AFFORD"),
    ("affordability check", "AFFORD"),
    
    # SPENDING
    ("how much did i spend on dining last month", "SPENDING"),
    ("breakdown of my groceries", "SPENDING"),
    ("what is my spending looking like", "SPENDING"),
    ("where did my money go", "SPENDING"),
    ("shopping expenses", "SPENDING"),
    ("show me my category health", "SPENDING"),
    
    # NET_WORTH
    ("what is my net worth", "NET_WORTH"),
    ("how much runway do i have", "NET_WORTH"),
    ("what is my liquid cash balance", "NET_WORTH"),
    ("overall financial health", "NET_WORTH"),
    ("cash flow check", "NET_WORTH"),
    ("burn rate", "NET_WORTH"),
    
    # GOALS
    ("how is my emergency fund doing", "GOALS"),
    ("how long until i reach my house deposit goal", "GOALS"),
    ("goals trajectory", "GOALS"),
    ("savings progress", "GOALS"),
    ("when will i save enough for my trip", "GOALS"),
    
    # DEFAULT
    ("hello", "DEFAULT"),
    ("give me a summary", "DEFAULT"),
    ("hi there", "DEFAULT"),
    ("financial assessment", "DEFAULT"),
]

class CopilotIntentClassifier:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english', max_features=1000)),
            ('clf', LogisticRegression(class_weight='balanced', random_state=42))
        ])
        self.is_trained = False

    def train_on_default_dataset(self):
        df = pd.DataFrame(INTENT_DATASET, columns=["text", "intent"])
        self.pipeline.fit(df["text"], df["intent"])
        self.is_trained = True

    def predict(self, query: str) -> str:
        if not self.is_trained:
            self.train_on_default_dataset()
        return self.pipeline.predict([query])[0]
    
    def predict_proba(self, query: str) -> dict:
        if not self.is_trained:
            self.train_on_default_dataset()
        probas = self.pipeline.predict_proba([query])[0]
        classes = self.pipeline.classes_
        return dict(zip(classes, probas))

# Singleton instance
intent_classifier = CopilotIntentClassifier()
