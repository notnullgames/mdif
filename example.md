---
name: Narnia
description: A land of rolling hills rising to low mountains in the south. It is predominantly forested except for marshlands in the north. The country is bordered on the east by the Eastern Ocean, on the west by a great mountain range, on the north by the River Shribble, and on the south by Archenland.
---

## Start

{{#konsumer.scared}}

I'm not talking to you, you're going to sword me!

{{/konsumer.scared}}


{{^konsumer.scared}}

> *konsumer* Hi, yer name is {{player.name}}, right?

- [hmm?](#start)
- [yes](#thats_my_name)
- [no](#lie_about_name)
- [wait, how do you know my name?](#lie_about_name)

{{/konsumer.scared}}


## That's My Name

> *konsumer* My name is konsumer. I think we'll be great friends.

> *{{player.name}}* Yeah?

> *konsumer* Say, I've got a proposition for you.

> *{{player.name}}* Yeh?

> *konsumer* Yep. So, here's the deal: I will give you this sword, but you have to promise to not hit me with it. Sound good?

- [what?](#thats_my_name)
- [ok, deal.](#take_sword)
- [no promises.](#no_promises)
- [lemme think about it](#goodbye)


## No Promises

> *konsumer* Well, that's freaky. Ok, are you sure?


- [I was just joking. I won't hit you with it](#take_sword)
- [I will definitely hit you with that sword.](#scare_konsumer)


## Scare Konsumer

> *konsumer* Ok, color me scared. I will avoid you in the future.

```js
konsumer.scared = true
```

[Good.](END)


## Lie About Name

> *konsumer* Tom said that was your name. Did he lie?

- [what?](#lie_about_name)
- [yes](#goodbye)
- [no](#thats_my_name)


## Take sword

> *konsumer* Ok, here ya go. Now remember: Don't hit me with it.

```js
player.inventory.push('konsumer_sword')
```


## Goodbye

> *konsumer* ok, see ya!

- [byeeee!](END)