---
name: Narnia
description: A land of rolling hills rising to low mountains in the south. It is predominantly forested except for marshlands in the north. The country is bordered on the east by the Eastern Ocean, on the west by a great mountain range, on the north by the River Shribble, and on the south by Archenland.
---

## Start

{{#konsumer.scared}}

> *konsumer* I'm not talking to you, you're going to sword me!

{{/konsumer.scared}}

{{^konsumer.scared}}

{{#konsumer.gaveSword}}

> *konsumer* How do you like the sword?

- [it's ok](#sword_ok)
- [it sucks](#sword_sucks)

{{/konsumer.gaveSword}}
{{^konsumer.gaveSword}}

> *konsumer* Hi, yer name is {{player.name}}, right?

- [hmm?](#start)
- [yes](#thats_my_name)
- [no](#lie_about_name)
- [wait, how do you know my name?](#lie_about_name)
{{/konsumer.gaveSword}}
{{/konsumer.scared}}

## Sword OK

> *konsumer* I am glad you like it. Whelp, see ya!


## Sword Sucks

> *konsumer* Sorry to hear that. Whelp, see ya!


## That's My Name

> *konsumer* My name is konsumer. I think we'll be great friends.

> *{{player.name}}* Yeah?

> *konsumer* Say, I've got a proposition for you.

> *{{player.name}}* Yeh?

> *konsumer* Yep. So, here's the deal: I will give you this sword, but you have to promise to not hit me with it.

> *konsumer* Sound good?

- [what?](#thats_my_name)
- [ok, deal.](#take_sword)
- [no promises.](#no_promises)
- [lemme think about it](#goodbye)


## No Promises

> *konsumer* Well, that's freaky.

> *konsumer* Ok, are you sure?


- [I was just joking.](#take_sword)
- [I'm serious.](#scare_konsumer)


## Scare Konsumer

> *konsumer* Ok, color me scared. I will avoid you in the future.

```js
konsumer.scared = true
```

[Good.](END)


## Lie About Name

> *konsumer* Tom said that was your name.

> *konsumer* Did he lie?

- [what?](#lie_about_name)
- [yes](#goodbye)
- [no](#thats_my_name)


## Take sword

> *konsumer* Ok, here ya go. Now remember: Don't hit me with it.

```js
player.inventory ||= []
player.inventory.push('konsumer_sword')
konsumer.gaveSword = true
```


## Goodbye

> *konsumer* ok, see ya!

- [byeeee!](END)