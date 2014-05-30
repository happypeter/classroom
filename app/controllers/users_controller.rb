class UsersController < ApplicationController
  def login
  end

  def classroom
  end

  def create_login_session
    user = User.find_by_name(params[:name])
    cookies.permanent[:name] = user.name
    redirect_to :classroom
  end

end
