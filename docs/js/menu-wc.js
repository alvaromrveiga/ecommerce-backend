'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ecommerce-backend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' : 'data-target="#xs-controllers-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' :
                                            'id="xs-controllers-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' : 'data-target="#xs-injectables-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' :
                                        'id="xs-injectables-links-module-AuthModule-cb136257545657cb853e3ee3945ac29614de9cde66ec4f843556592a42e6fd3a93f5e9edbf3a43eb2631502e1c60fabae8360264620399d063f90d14a70edb2c"' }>
                                        <li class="link">
                                            <a href="injectables/AccessJwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccessJwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CategoryModule.html" data-type="entity-link" >CategoryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' : 'data-target="#xs-controllers-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' :
                                            'id="xs-controllers-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' }>
                                            <li class="link">
                                                <a href="controllers/CategoryController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' : 'data-target="#xs-injectables-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' :
                                        'id="xs-injectables-links-module-CategoryModule-39a2804edd6fe50bdc396922d77cd7e3a74442b298d6599c492608ff82b51c912638f638b37e2db462271c58b2ac3481f7503deba5583e8431354f4dcb317512"' }>
                                        <li class="link">
                                            <a href="injectables/CategoryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PrismaModule.html" data-type="entity-link" >PrismaModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-PrismaModule-0a30996d1235bf2604a3c3e09c8f1199d43cb26cc3a3c409db2ea23ad71bf181806b1da96cfc90d204e717a917b83b7d35bd1c8bff82b9170de5064b4a322113"' : 'data-target="#xs-injectables-links-module-PrismaModule-0a30996d1235bf2604a3c3e09c8f1199d43cb26cc3a3c409db2ea23ad71bf181806b1da96cfc90d204e717a917b83b7d35bd1c8bff82b9170de5064b4a322113"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PrismaModule-0a30996d1235bf2604a3c3e09c8f1199d43cb26cc3a3c409db2ea23ad71bf181806b1da96cfc90d204e717a917b83b7d35bd1c8bff82b9170de5064b4a322113"' :
                                        'id="xs-injectables-links-module-PrismaModule-0a30996d1235bf2604a3c3e09c8f1199d43cb26cc3a3c409db2ea23ad71bf181806b1da96cfc90d204e717a917b83b7d35bd1c8bff82b9170de5064b4a322113"' }>
                                        <li class="link">
                                            <a href="injectables/PrismaService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrismaService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ProductModule.html" data-type="entity-link" >ProductModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' : 'data-target="#xs-controllers-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' :
                                            'id="xs-controllers-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' }>
                                            <li class="link">
                                                <a href="controllers/ProductController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' : 'data-target="#xs-injectables-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' :
                                        'id="xs-injectables-links-module-ProductModule-8316f7ca42f0d61476fc193f03bd70793a11cbe8e983a78d5363d17b64e138d65f548629c209c4803f3d827250fea6780447a6934739ff58d073fd00796c62db"' }>
                                        <li class="link">
                                            <a href="injectables/ProductService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PurchaseModule.html" data-type="entity-link" >PurchaseModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' : 'data-target="#xs-controllers-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' :
                                            'id="xs-controllers-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' }>
                                            <li class="link">
                                                <a href="controllers/PurchaseController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' : 'data-target="#xs-injectables-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' :
                                        'id="xs-injectables-links-module-PurchaseModule-95395a1d900a919a308cd85cc6f20963ad1b74a1cf46486ae4d0bbb9812d2f53d3cb8ecc6220f1ab8e446edbf7a8e033dc27b453035ac13f38f4c928fa95f42f"' }>
                                        <li class="link">
                                            <a href="injectables/PurchaseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' : 'data-target="#xs-controllers-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' :
                                            'id="xs-controllers-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' }>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' : 'data-target="#xs-injectables-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' :
                                        'id="xs-injectables-links-module-UserModule-5013f663bf9847c8f8c4588ea9e56166653fc4dac52f59c9e0ba73154fd371b11659e15614777a0ef9b7f465d8ae2f70d5b32590f968719d3e8fd73c5129adf0"' }>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AuthServiceInputException.html" data-type="entity-link" >AuthServiceInputException</a>
                            </li>
                            <li class="link">
                                <a href="classes/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryNameInUseException.html" data-type="entity-link" >CategoryNameInUseException</a>
                            </li>
                            <li class="link">
                                <a href="classes/CategoryNotFoundException.html" data-type="entity-link" >CategoryNotFoundException</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCategoryDto.html" data-type="entity-link" >CreateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateProductDto.html" data-type="entity-link" >CreateProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePurchaseDto.html" data-type="entity-link" >CreatePurchaseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteUserDto.html" data-type="entity-link" >DeleteUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EmailInUseException.html" data-type="entity-link" >EmailInUseException</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileTypeError.html" data-type="entity-link" >FileTypeError</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileUploadDto.html" data-type="entity-link" >FileUploadDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FindCategoriesDto.html" data-type="entity-link" >FindCategoriesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FindProductsDto.html" data-type="entity-link" >FindProductsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FindPurchasesDto.html" data-type="entity-link" >FindPurchasesDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidEmailOrPasswordException.html" data-type="entity-link" >InvalidEmailOrPasswordException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidPasswordUpdateException.html" data-type="entity-link" >InvalidPasswordUpdateException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidRefreshTokenException.html" data-type="entity-link" >InvalidRefreshTokenException</a>
                            </li>
                            <li class="link">
                                <a href="classes/JwtExceptionHandler.html" data-type="entity-link" >JwtExceptionHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginCredentialsDto.html" data-type="entity-link" >LoginCredentialsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="classes/LogoutDto.html" data-type="entity-link" >LogoutDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MissingPasswordUpdateException.html" data-type="entity-link" >MissingPasswordUpdateException</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotPurchaseOwnerException.html" data-type="entity-link" >NotPurchaseOwnerException</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrismaExceptionHandler.html" data-type="entity-link" >PrismaExceptionHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/Product.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductNameInUseException.html" data-type="entity-link" >ProductNameInUseException</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductNotFoundException.html" data-type="entity-link" >ProductNotFoundException</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProductServiceInputException.html" data-type="entity-link" >ProductServiceInputException</a>
                            </li>
                            <li class="link">
                                <a href="classes/Purchase.html" data-type="entity-link" >Purchase</a>
                            </li>
                            <li class="link">
                                <a href="classes/PurchaseNotFoundException.html" data-type="entity-link" >PurchaseNotFoundException</a>
                            </li>
                            <li class="link">
                                <a href="classes/PurchaseServiceInputException.html" data-type="entity-link" >PurchaseServiceInputException</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenDto.html" data-type="entity-link" >RefreshTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ReviewPurchaseDto.html" data-type="entity-link" >ReviewPurchaseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCategoryDto.html" data-type="entity-link" >UpdateCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateProductDto.html" data-type="entity-link" >UpdateProductDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePurchaseDto.html" data-type="entity-link" >UpdatePurchaseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserRoleDto.html" data-type="entity-link" >UpdateUserRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserInputExceptionHandler.html" data-type="entity-link" >UserInputExceptionHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserNotFoundException.html" data-type="entity-link" >UserNotFoundException</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserServiceInputException.html" data-type="entity-link" >UserServiceInputException</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserWithoutPassword.html" data-type="entity-link" >UserWithoutPassword</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AccessJwtAuthGuard.html" data-type="entity-link" >AccessJwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExceptionInterceptor.html" data-type="entity-link" >ExceptionInterceptor</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ExceptionHandler.html" data-type="entity-link" >ExceptionHandler</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});