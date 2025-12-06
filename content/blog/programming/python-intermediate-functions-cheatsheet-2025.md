---
title: "【脱初心者】Pythonを使いこなす関数・テクニック完全ガイド2025"
date: "2025-12-07"
publishDate: "2025-12-12"
description: "Lambda、map/filter、dataclasses、パターンマッチングなど、Python中級者が知っておくべき関数とテクニックを徹底解説。Python 3.12/3.13の最新機能も網羅。"
tags: ["Python", "チートシート", "プログラミング", "関数型プログラミング", "Python3.13"]
author: "Adabana Saki"
---

# Python脱初心者のための関数・テクニック完全ガイド

「for文とif文で何でも書けるけど、もっとスマートに書きたい...」

「他の人のコードを見ると、見たことない書き方がたくさん出てくる...」

Pythonの基礎を覚えた後、多くの人がぶつかる壁です。私も最初は `for` と `if` の組み合わせで何でも書いていました。でも、Pythonには**もっとエレガントで効率的な書き方**がたくさんあるんです。

この記事では、Python中級者〜上級者が知っておくべき関数やテクニックを、実践的なコード例とともに解説します。2025年現在の最新機能（Python 3.13）も含めて、これさえ押さえておけば「Pythonicなコード」が書けるようになりますよ。

:::note info 対象読者
- Pythonの基礎（変数、リスト、辞書、関数定義）は分かる
- `for` 文や `if` 文は問題なく使える
- でも、もっと効率的・スマートに書きたい
:::

## Lambda関数 ― 無名関数の威力

### 基本構文

Lambda関数は「名前のない小さな関数」です。一行で関数を定義できます。

```python
# 通常の関数定義
def square(x):
    return x ** 2

# Lambda関数で同じことを書く
square = lambda x: x ** 2

# どちらも同じ結果
print(square(5))  # 25
```

「わざわざLambdaを使う意味あるの？」と思いますよね。Lambda関数の真価は、**他の関数と組み合わせたとき**に発揮されます。

### sorted() との組み合わせ

```python
# 辞書のリストを特定のキーでソートしたい
users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35}
]

# 年齢でソート
sorted_by_age = sorted(users, key=lambda x: x["age"])
# [{'name': 'Bob', 'age': 25}, {'name': 'Alice', 'age': 30}, {'name': 'Charlie', 'age': 35}]

# 名前の長さでソート
sorted_by_name_length = sorted(users, key=lambda x: len(x["name"]))
# [{'name': 'Bob', 'age': 25}, {'name': 'Alice', 'age': 30}, {'name': 'Charlie', 'age': 35}]
```

### 複数条件でのソート

```python
# 部署でソート、同じ部署内では年齢でソート
employees = [
    {"name": "Alice", "dept": "Engineering", "age": 30},
    {"name": "Bob", "dept": "Sales", "age": 25},
    {"name": "Charlie", "dept": "Engineering", "age": 28},
]

sorted_employees = sorted(employees, key=lambda x: (x["dept"], x["age"]))
# Engineering が先に来て、その中で年齢順に並ぶ
```

### max() / min() との組み合わせ

```python
products = [
    {"name": "Laptop", "price": 1200, "stock": 5},
    {"name": "Mouse", "price": 25, "stock": 100},
    {"name": "Keyboard", "price": 75, "stock": 30},
]

# 最も高い商品
most_expensive = max(products, key=lambda x: x["price"])
# {'name': 'Laptop', 'price': 1200, 'stock': 5}

# 在庫が最も少ない商品
lowest_stock = min(products, key=lambda x: x["stock"])
# {'name': 'Laptop', 'price': 1200, 'stock': 5}
```

## map / filter / reduce ― 関数型プログラミングの基本

### map() ― 全要素に関数を適用

```python
numbers = [1, 2, 3, 4, 5]

# 全要素を2乗
squared = list(map(lambda x: x ** 2, numbers))
# [1, 4, 9, 16, 25]

# 文字列のリストを整数に変換
str_numbers = ["1", "2", "3", "4", "5"]
int_numbers = list(map(int, str_numbers))
# [1, 2, 3, 4, 5]
```

### filter() ― 条件に合う要素を抽出

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 偶数だけ抽出
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4, 6, 8, 10]

# 空文字列を除去
words = ["hello", "", "world", "", "python"]
non_empty = list(filter(None, words))  # Noneを渡すとFalsyな値を除去
# ['hello', 'world', 'python']
```

### functools.reduce() ― 累積計算

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# 総和を計算（1 + 2 + 3 + 4 + 5）
total = reduce(lambda acc, x: acc + x, numbers)
# 15

# 総積を計算（1 * 2 * 3 * 4 * 5）
product = reduce(lambda acc, x: acc * x, numbers)
# 120

# 最大値を見つける（max()と同等）
maximum = reduce(lambda acc, x: acc if acc > x else x, numbers)
# 5
```

### いつ何を使う？

| やりたいこと | 使うべきもの | 例 |
|------------|------------|-----|
| 全要素を変換 | `map()` またはリスト内包表記 | 文字列→整数変換 |
| 条件で絞り込み | `filter()` またはリスト内包表記 | 偶数だけ抽出 |
| 1つの値に集約 | `reduce()` または `sum()` 等 | 合計、最大値 |

:::note tip 内包表記 vs map/filter
Pythonでは、`map()` や `filter()` よりも**内包表記**が好まれることが多いです。可読性が高く、Pythonicとされています。

```python
# map + filter
result = list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))

# 内包表記（こちらが推奨）
result = [x ** 2 for x in numbers if x % 2 == 0]
```

ただし、既存の関数を適用する場合は `map()` が簡潔です。
```python
# これは map() の方がシンプル
int_list = list(map(int, str_list))
```
:::

## 内包表記 ― Pythonらしさの象徴

### リスト内包表記の応用

```python
# 基本形
squares = [x ** 2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 条件付き
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# if-else を使う（位置に注意！）
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
# ['even', 'odd', 'even', 'odd', 'even']

# ネストしたループ
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 辞書内包表記

```python
# キーと値を入れ替え
original = {"a": 1, "b": 2, "c": 3}
swapped = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# リストから辞書を作成
names = ["Alice", "Bob", "Charlie"]
name_lengths = {name: len(name) for name in names}
# {'Alice': 5, 'Bob': 3, 'Charlie': 7}

# 条件付きで辞書をフィルタリング
scores = {"Alice": 85, "Bob": 92, "Charlie": 78, "David": 95}
passed = {name: score for name, score in scores.items() if score >= 80}
# {'Alice': 85, 'Bob': 92, 'David': 95}
```

### 集合内包表記

```python
# 重複を自動的に除去
words = ["hello", "world", "hello", "python", "world"]
unique_lengths = {len(word) for word in words}
# {5, 6}  # 5文字と6文字の単語がある
```

### ジェネレータ式 ― メモリ効率の良い処理

```python
# リスト内包表記（全要素をメモリに保持）
squares_list = [x ** 2 for x in range(1000000)]

# ジェネレータ式（必要なときだけ計算）
squares_gen = (x ** 2 for x in range(1000000))

# 大量のデータを処理するときはジェネレータ式が効率的
total = sum(x ** 2 for x in range(1000000))  # 括弧は省略可能
```

## collectionsモジュール ― 特殊なコンテナ型

### Counter ― 要素のカウント

```python
from collections import Counter

# 文字の出現回数をカウント
text = "abracadabra"
counter = Counter(text)
# Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})

# 最も多い要素を取得
counter.most_common(3)
# [('a', 5), ('b', 2), ('r', 2)]

# 単語の出現回数をカウント
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
word_count = Counter(words)
# Counter({'apple': 3, 'banana': 2, 'cherry': 1})

# Counter同士の演算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)  # Counter({'a': 4, 'b': 3})
print(c1 - c2)  # Counter({'a': 2})  # 負の値は除外される
```

### defaultdict ― デフォルト値付き辞書

```python
from collections import defaultdict

# 通常の辞書だと KeyError が発生する場面で便利
# グループ化の例
students = [
    ("Alice", "Math"),
    ("Bob", "Physics"),
    ("Charlie", "Math"),
    ("David", "Physics"),
]

# 従来の書き方
groups = {}
for name, subject in students:
    if subject not in groups:
        groups[subject] = []
    groups[subject].append(name)

# defaultdictを使うと
groups = defaultdict(list)
for name, subject in students:
    groups[subject].append(name)
# defaultdict(<class 'list'>, {'Math': ['Alice', 'Charlie'], 'Physics': ['Bob', 'David']})

# カウントの例
word_count = defaultdict(int)
for word in ["apple", "banana", "apple"]:
    word_count[word] += 1
# defaultdict(<class 'int'>, {'apple': 2, 'banana': 1})
```

### namedtuple ― 名前付きタプル

```python
from collections import namedtuple

# 座標を表すデータ構造
Point = namedtuple("Point", ["x", "y"])

p1 = Point(3, 4)
print(p1.x, p1.y)  # 3 4
print(p1[0], p1[1])  # 3 4（インデックスでもアクセス可能）

# アンパックも可能
x, y = p1
print(x, y)  # 3 4

# データベースのレコードを表現
User = namedtuple("User", ["id", "name", "email"])
user = User(1, "Alice", "alice@example.com")
print(f"ID: {user.id}, Name: {user.name}")

# 辞書との相互変換
user_dict = user._asdict()
# {'id': 1, 'name': 'Alice', 'email': 'alice@example.com'}
```

### deque ― 両端キュー

```python
from collections import deque

# 両端からの追加・削除が O(1)
d = deque([1, 2, 3])

d.append(4)      # 右端に追加: [1, 2, 3, 4]
d.appendleft(0)  # 左端に追加: [0, 1, 2, 3, 4]
d.pop()          # 右端から削除: [0, 1, 2, 3]
d.popleft()      # 左端から削除: [1, 2, 3]

# 最大長を指定（古い要素は自動削除）
recent = deque(maxlen=3)
for i in range(5):
    recent.append(i)
    print(list(recent))
# [0]
# [0, 1]
# [0, 1, 2]
# [1, 2, 3]  # 0が押し出された
# [2, 3, 4]  # 1が押し出された

# ローテーション
d = deque([1, 2, 3, 4, 5])
d.rotate(2)   # 右に2つ回転: [4, 5, 1, 2, 3]
d.rotate(-2)  # 左に2つ回転: [1, 2, 3, 4, 5]
```

## itertoolsモジュール ― イテレータの魔法

### chain ― 複数のイテレータを連結

```python
from itertools import chain

list1 = [1, 2, 3]
list2 = [4, 5, 6]
list3 = [7, 8, 9]

# 複数のリストを1つとして処理
for item in chain(list1, list2, list3):
    print(item, end=" ")
# 1 2 3 4 5 6 7 8 9

# リストのリストをフラット化
nested = [[1, 2], [3, 4], [5, 6]]
flattened = list(chain.from_iterable(nested))
# [1, 2, 3, 4, 5, 6]
```

### combinations / permutations ― 組み合わせと順列

```python
from itertools import combinations, permutations

items = ["A", "B", "C"]

# 組み合わせ（順序を考慮しない）
print(list(combinations(items, 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'C')]

# 順列（順序を考慮する）
print(list(permutations(items, 2)))
# [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]

# パスワードの総当たり（短い例）
from itertools import product
chars = "ab"
for combo in product(chars, repeat=3):
    print("".join(combo))
# aaa, aab, aba, abb, baa, bab, bba, bbb
```

### groupby ― グループ化

```python
from itertools import groupby

# 注意: groupbyは連続した要素をグループ化する
# 事前にソートが必要なことが多い
data = [
    {"name": "Alice", "dept": "Engineering"},
    {"name": "Bob", "dept": "Sales"},
    {"name": "Charlie", "dept": "Engineering"},
    {"name": "David", "dept": "Sales"},
]

# 部署でソートしてからグループ化
sorted_data = sorted(data, key=lambda x: x["dept"])
for dept, group in groupby(sorted_data, key=lambda x: x["dept"]):
    print(f"{dept}: {[p['name'] for p in group]}")
# Engineering: ['Alice', 'Charlie']
# Sales: ['Bob', 'David']
```

### islice ― イテレータのスライス

```python
from itertools import islice

# 巨大なファイルの最初の10行だけ読む
def read_first_n_lines(filename, n):
    with open(filename) as f:
        return list(islice(f, n))

# 無限イテレータから必要な分だけ取得
from itertools import count
first_10_evens = list(islice((x for x in count() if x % 2 == 0), 10))
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
```

### takewhile / dropwhile ― 条件付きの取得

```python
from itertools import takewhile, dropwhile

numbers = [2, 4, 6, 8, 1, 3, 5, 7]

# 条件を満たす間だけ取得
result = list(takewhile(lambda x: x % 2 == 0, numbers))
# [2, 4, 6, 8]  # 1が出てきた時点で終了

# 条件を満たす間はスキップ
result = list(dropwhile(lambda x: x % 2 == 0, numbers))
# [1, 3, 5, 7]  # 1以降を全て取得
```

## functoolsモジュール ― 関数を操作する関数

### partial ― 部分適用

```python
from functools import partial

# 引数の一部を固定した新しい関数を作る
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

print(square(5))  # 25
print(cube(5))    # 125

# APIクライアントの例
import requests

def fetch_api(base_url, endpoint, params=None):
    return requests.get(f"{base_url}{endpoint}", params=params)

# プロダクション用とステージング用のクライアント
fetch_prod = partial(fetch_api, "https://api.example.com")
fetch_staging = partial(fetch_api, "https://staging.api.example.com")
```

### lru_cache ― メモ化（結果のキャッシュ）

```python
from functools import lru_cache

# フィボナッチ数列（キャッシュなし：とても遅い）
def fib_slow(n):
    if n < 2:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)

# フィボナッチ数列（キャッシュあり：超高速）
@lru_cache(maxsize=None)
def fib_fast(n):
    if n < 2:
        return n
    return fib_fast(n - 1) + fib_fast(n - 2)

# fib_slow(35) は数秒かかる
# fib_fast(35) は一瞬で終わる

# キャッシュの統計情報
print(fib_fast.cache_info())
# CacheInfo(hits=33, misses=36, maxsize=None, currsize=36)

# キャッシュをクリア
fib_fast.cache_clear()
```

:::note tip Python 3.9以降
`@functools.cache` という `@lru_cache(maxsize=None)` と同等のデコレータが追加されました。
```python
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```
:::

### wraps ― デコレータを正しく作る

```python
from functools import wraps
import time

# wrapsなしのデコレータ（関数の情報が失われる）
def timer_bad(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Elapsed: {time.time() - start:.2f}s")
        return result
    return wrapper

# wrapsありのデコレータ（推奨）
def timer_good(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Elapsed: {time.time() - start:.2f}s")
        return result
    return wrapper

@timer_good
def slow_function():
    """This is a slow function."""
    time.sleep(1)

print(slow_function.__name__)  # "slow_function"（wrapsがないと"wrapper"になる）
print(slow_function.__doc__)   # "This is a slow function."
```

## dataclasses ― ボイラープレートの削減

### 基本的な使い方

```python
from dataclasses import dataclass

# 従来の書き方
class UserOld:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

    def __repr__(self):
        return f"User(name={self.name}, age={self.age}, email={self.email})"

    def __eq__(self, other):
        return (self.name, self.age, self.email) == (other.name, other.age, other.email)

# dataclassを使うと
@dataclass
class User:
    name: str
    age: int
    email: str

# __init__, __repr__, __eq__ が自動生成される
user = User("Alice", 30, "alice@example.com")
print(user)  # User(name='Alice', age=30, email='alice@example.com')
```

### デフォルト値と不変性

```python
from dataclasses import dataclass, field
from typing import List

@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False

    # ミュータブルなデフォルト値は field() を使う
    allowed_hosts: List[str] = field(default_factory=list)

config = Config()
print(config.host)  # "localhost"

# イミュータブル（変更不可）にする
@dataclass(frozen=True)
class Point:
    x: float
    y: float

p = Point(3.0, 4.0)
# p.x = 5.0  # FrozenInstanceError が発生
```

### 比較とソート

```python
from dataclasses import dataclass

@dataclass(order=True)
class Student:
    # sort_index を使ってソート基準を制御
    sort_index: int = field(init=False, repr=False)
    name: str
    grade: int

    def __post_init__(self):
        self.sort_index = self.grade

students = [
    Student("Alice", 85),
    Student("Bob", 92),
    Student("Charlie", 78),
]

sorted_students = sorted(students)  # grade順にソートされる
```

### asdict と astuple

```python
from dataclasses import dataclass, asdict, astuple

@dataclass
class Person:
    name: str
    age: int

person = Person("Alice", 30)

# 辞書に変換
person_dict = asdict(person)
# {'name': 'Alice', 'age': 30}

# タプルに変換
person_tuple = astuple(person)
# ('Alice', 30)

# JSONに変換するときに便利
import json
json_str = json.dumps(asdict(person))
# '{"name": "Alice", "age": 30}'
```

## ウォルラス演算子 (:=) ― 代入式

Python 3.8で追加された「セイウチ演算子」。変数への代入と、その値の使用を同時に行えます。

### 基本的な使い方

```python
# 従来の書き方
n = len(some_list)
if n > 10:
    print(f"List is too long ({n} elements)")

# ウォルラス演算子を使うと
if (n := len(some_list)) > 10:
    print(f"List is too long ({n} elements)")
```

### ファイル読み込み

```python
# 従来の書き方
while True:
    line = file.readline()
    if not line:
        break
    process(line)

# ウォルラス演算子を使うと
while (line := file.readline()):
    process(line)
```

### 正規表現マッチング

```python
import re

text = "My email is alice@example.com"
pattern = r"[\w.-]+@[\w.-]+"

# 従来の書き方
match = re.search(pattern, text)
if match:
    print(f"Found: {match.group()}")

# ウォルラス演算子を使うと
if (match := re.search(pattern, text)):
    print(f"Found: {match.group()}")
```

### リスト内包表記での活用

```python
# 高コストな関数を複数回呼び出してしまう例
results = [compute(x) for x in data if compute(x) > threshold]

# ウォルラス演算子で1回だけ呼び出す
results = [y for x in data if (y := compute(x)) > threshold]
```

### any() / all() との組み合わせ

```python
# 条件を満たす最初の要素を見つける
numbers = [1, 3, 5, 8, 9, 11]

if any((even := x) % 2 == 0 for x in numbers):
    print(f"Found even number: {even}")
# Found even number: 8
```

## パターンマッチング (match/case) ― Python 3.10+

### 基本構文

```python
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return "Unknown Status"

print(http_status(200))  # "OK"
print(http_status(418))  # "Unknown Status"
```

### 構造化パターン

```python
# タプルのパターン
def process_point(point):
    match point:
        case (0, 0):
            return "Origin"
        case (0, y):
            return f"On Y-axis at y={y}"
        case (x, 0):
            return f"On X-axis at x={x}"
        case (x, y):
            return f"Point at ({x}, {y})"

print(process_point((0, 0)))   # "Origin"
print(process_point((0, 5)))   # "On Y-axis at y=5"
print(process_point((3, 4)))   # "Point at (3, 4)"
```

### 辞書のパターン

```python
def process_command(command):
    match command:
        case {"action": "move", "direction": direction}:
            return f"Moving {direction}"
        case {"action": "attack", "target": target}:
            return f"Attacking {target}"
        case {"action": "heal", "amount": amount}:
            return f"Healing {amount} HP"
        case _:
            return "Unknown command"

print(process_command({"action": "move", "direction": "north"}))
# "Moving north"
```

### ガード条件

```python
def categorize_number(n):
    match n:
        case x if x < 0:
            return "Negative"
        case x if x == 0:
            return "Zero"
        case x if x < 10:
            return "Small positive"
        case x if x < 100:
            return "Medium positive"
        case _:
            return "Large positive"

print(categorize_number(-5))   # "Negative"
print(categorize_number(50))   # "Medium positive"
```

### クラスのパターン

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

@dataclass
class Circle:
    center: Point
    radius: int

def describe_shape(shape):
    match shape:
        case Circle(center=Point(x=0, y=0), radius=r):
            return f"Circle at origin with radius {r}"
        case Circle(center=Point(x=x, y=y), radius=r):
            return f"Circle at ({x}, {y}) with radius {r}"
        case Point(x=x, y=y):
            return f"Point at ({x}, {y})"

circle = Circle(Point(0, 0), 5)
print(describe_shape(circle))  # "Circle at origin with radius 5"
```

## Python 3.12 / 3.13 の新機能

### より柔軟なf-string（Python 3.12）

```python
# Python 3.12以降、f-string内でクォートの再利用が可能
names = ["Alice", "Bob", "Charlie"]

# 3.11以前は SyntaxError だった
message = f"Names: {", ".join(names)}"
# "Names: Alice, Bob, Charlie"

# 複数行の式も書ける
result = f"Result: {
    sum(x ** 2 for x in range(10))
}"

# バックスラッシュも使える
path = f"C:\\Users\\{username}"
```

### 型パラメータ構文（Python 3.12）

```python
# Python 3.11以前
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

# Python 3.12以降（よりシンプル）
class Stack[T]:
    def __init__(self) -> None:
        self.items: list[T] = []

    def push(self, item: T) -> None:
        self.items.append(item)

    def pop(self) -> T:
        return self.items.pop()

# 型エイリアスも簡潔に
type Point = tuple[float, float]
type Vector[T] = list[T]
```

### 新しいインタラクティブシェル（Python 3.13）

Python 3.13では、PyPyプロジェクトのコードをベースにした新しいREPLが導入されました。

```text
【新機能】
- マルチライン編集（複数行の履歴を保持）
- シンタックスハイライト（カラー表示）
- help, exit, quit を括弧なしで実行可能
- F1: ヘルプブラウザ
- F2: 履歴ブラウズ（出力を除いた形で）
- F3: ペーストモード（大きなコードブロックの貼り付けが容易）
```

### 実験的機能：JITコンパイラとフリースレッドモード（Python 3.13）

```python
# JITコンパイラ（--enable-experimental-jit でビルド）
# 計算集約型の処理で5-15%の高速化が期待できる

# フリースレッドモード（GILなし）
# --disable-gil オプションでビルドされたPythonで利用可能
# 真のマルチスレッド処理が可能に

# 確認方法
import sys
print(sys._is_gil_enabled())  # Python 3.13+
```

:::note warn 実験的機能について
JITコンパイラとフリースレッドモードは2025年現在、まだ実験的機能です。本番環境での使用は慎重に検討してください。多くのC拡張ライブラリはまだフリースレッドモードに対応していません。
:::

## 実践Tips：よく使うパターン集

### ファイル操作

```python
from pathlib import Path

# ファイルの読み書き（1行で）
content = Path("file.txt").read_text()
Path("output.txt").write_text("Hello, World!")

# ファイル一覧の取得
python_files = list(Path(".").glob("**/*.py"))

# JSONファイルの読み書き
import json
data = json.loads(Path("config.json").read_text())
Path("output.json").write_text(json.dumps(data, indent=2))
```

### 辞書操作のイディオム

```python
# 辞書のマージ（Python 3.9+）
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
merged = dict1 | dict2  # {'a': 1, 'b': 3, 'c': 4}

# 安全に値を取得（デフォルト値付き）
value = config.get("key", "default_value")

# 存在しないキーに値を設定
config.setdefault("new_key", []).append("item")

# 複数キーの削除
keys_to_remove = ["key1", "key2", "key3"]
for key in keys_to_remove:
    data.pop(key, None)  # キーがなくてもエラーにならない
```

### エラーハンドリング

```python
# 複数の例外をまとめてキャッチ
try:
    result = risky_operation()
except (ValueError, TypeError, KeyError) as e:
    print(f"Error: {e}")

# 例外の連鎖を明示
try:
    process_data(data)
except ValueError as e:
    raise RuntimeError("Data processing failed") from e

# contextlibでリソース管理
from contextlib import contextmanager

@contextmanager
def timer(name):
    import time
    start = time.time()
    yield
    print(f"{name}: {time.time() - start:.2f}s")

with timer("Processing"):
    heavy_computation()
```

### その他の便利テクニック

```python
# 変数の入れ替え
a, b = b, a

# 複数の戻り値
def get_user_info():
    return "Alice", 30, "alice@example.com"

name, age, email = get_user_info()

# アンパック演算子
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2, 3, 4], last=5

# 条件式（三項演算子）
status = "adult" if age >= 18 else "minor"

# 論理演算子の短絡評価
name = user_name or "Anonymous"  # user_nameがFalsyなら"Anonymous"
config = load_config() or {}     # 設定がなければ空辞書
```

## まとめ ― この記事で紹介した機能一覧

| カテゴリ | 機能 | 主な用途 |
|---------|------|----------|
| **関数型** | `lambda` | 小さな無名関数 |
| | `map()` / `filter()` | イテラブルの変換・抽出 |
| | `functools.reduce()` | 累積計算 |
| **内包表記** | リスト/辞書/集合内包表記 | コレクションの生成 |
| | ジェネレータ式 | メモリ効率の良い処理 |
| **collections** | `Counter` | 要素のカウント |
| | `defaultdict` | デフォルト値付き辞書 |
| | `namedtuple` | 名前付きタプル |
| | `deque` | 両端キュー |
| **itertools** | `chain`, `combinations` | イテレータ操作 |
| | `groupby`, `islice` | グループ化・スライス |
| **functools** | `partial` | 部分適用 |
| | `lru_cache` / `cache` | メモ化 |
| | `wraps` | デコレータ作成 |
| **dataclasses** | `@dataclass` | クラスの簡潔な定義 |
| **構文** | `:=`（ウォルラス演算子） | 代入式 |
| | `match/case` | パターンマッチング |

### 学習のおすすめ順序

1. **まず覚える**: 内包表記、`lambda`、`sorted()` のkey引数
2. **次に覚える**: `Counter`、`defaultdict`、`lru_cache`
3. **その後**: `dataclass`、ウォルラス演算子、パターンマッチング
4. **必要に応じて**: `itertools`、`functools.partial`

一度に全部覚える必要はありません。実際のコードを書く中で「こういうときに使えるな」と思い出せれば十分です。この記事をブックマークしておいて、必要なときに見返してください。

## 参考リンク

- [Python公式ドキュメント（日本語）](https://docs.python.org/ja/3/)
- [What's New In Python 3.13](https://docs.python.org/3/whatsnew/3.13.html)
- [What's New In Python 3.12](https://docs.python.org/3/whatsnew/3.12.html)
- [Real Python - Python Data Classes](https://realpython.com/python-data-classes/)
- [Python Tips - Collections](https://book.pythontips.com/en/latest/collections.html)
- [PEP 634 - Structural Pattern Matching](https://peps.python.org/pep-0634/)
